from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from backend.core.config import settings
from backend.core.logger import logger
from bson import ObjectId
import time
import requests

class MockCursor(list):
    def sort(self, key_or_list, direction=None):
        if isinstance(key_or_list, list):
            key = key_or_list[0][0]
            direction = key_or_list[0][1]
        else:
            key = key_or_list
            
        reverse = (direction == -1)
        super().sort(key=lambda x: x.get(key, 0) if x.get(key) is not None else 0, reverse=reverse)
        return self

    def limit(self, n):
        return MockCursor(self[:n])

class MockCollection:
    def __init__(self, name, db):
        self.name = name
        self.db = db
        if name not in self.db._data:
            self.db._data[name] = []

    def _matches(self, doc, query):
        if not query:
            return True
        for qk, qv in query.items():
            if isinstance(qv, dict):
                # Handle operators like $in, $nin, etc.
                for op, op_val in qv.items():
                    if op == "$in":
                        if doc.get(qk) not in op_val:
                            return False
                    elif op == "$nin":
                        if doc.get(qk) in op_val:
                            return False
                    else:
                        if doc.get(qk) != qv:
                            return False
            else:
                # Direct match
                doc_val = doc.get(qk)
                if qk in ("_id", "user_id", "startup_id", "opportunity_id") or isinstance(doc_val, str) or isinstance(qv, str):
                    if str(doc_val) != str(qv):
                        return False
                elif doc_val != qv:
                    return False
        return True

    def find_one(self, query=None, sort=None):
        query = query or {}
        docs = self.find(query)
        if sort:
            key = sort[0][0]
            reverse = sort[0][1] == -1
            docs = sorted(docs, key=lambda x: x.get(key, 0) if x.get(key) is not None else 0, reverse=reverse)
        return docs[0] if docs else None

    def find(self, query=None):
        query = query or {}
        res = MockCursor()
        for doc in self.db._data[self.name]:
            if self._matches(doc, query):
                res.append(doc.copy())
        return res

    def insert_one(self, doc):
        from bson import ObjectId
        doc = doc.copy()
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self.db._data[self.name].append(doc)
        
        class InsertOneResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertOneResult(doc["_id"])

    def insert_many(self, docs):
        from bson import ObjectId
        inserted_ids = []
        for doc in docs:
            doc = doc.copy()
            if "_id" not in doc:
                doc["_id"] = ObjectId()
            self.db._data[self.name].append(doc)
            inserted_ids.append(doc["_id"])
        
        class InsertManyResult:
            def __init__(self, ids):
                self.inserted_ids = ids
        return InsertManyResult(inserted_ids)

    def update_one(self, query, update, upsert=False):
        docs = self.find(query)
        if not docs:
            if upsert:
                new_doc = query.copy()
                if "$set" in update:
                    new_doc.update(update["$set"])
                self.insert_one(new_doc)
            return
            
        doc_to_update = None
        for doc in self.db._data[self.name]:
            if doc["_id"] == docs[0]["_id"]:
                doc_to_update = doc
                break
                
        if doc_to_update and "$set" in update:
            doc_to_update.update(update["$set"])

    def update_many(self, query, update):
        docs = self.find(query)
        doc_ids = [d["_id"] for d in docs]
        for doc in self.db._data[self.name]:
            if doc["_id"] in doc_ids:
                if "$set" in update:
                    doc.update(update["$set"])

    def delete_one(self, query):
        doc = self.find_one(query)
        if doc:
            self.db._data[self.name] = [d for d in self.db._data[self.name] if d["_id"] != doc["_id"]]
            
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(1 if doc else 0)

    def delete_many(self, query):
        docs = self.find(query)
        doc_ids = [d["_id"] for d in docs]
        self.db._data[self.name] = [d for d in self.db._data[self.name] if d["_id"] not in doc_ids]
        
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(len(docs))

    def count_documents(self, query):
        return len(self.find(query))

    def create_index(self, keys, unique=False, sparse=False):
        pass

class MockDB:
    def __init__(self):
        self._data = {}

    def __getattr__(self, name):
        return MockCollection(name, self)


def clean_mongo_doc(doc):
    """Helper function to serialize PyMongo BSON values into standard JSON formats."""
    if not isinstance(doc, dict):
        return doc
    new_doc = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            new_doc[k] = str(v)
        elif isinstance(v, dict):
            new_doc[k] = clean_mongo_doc(v)
        elif isinstance(v, list):
            new_doc[k] = [
                clean_mongo_doc(item) if isinstance(item, dict) 
                else (str(item) if isinstance(item, ObjectId) else item) 
                for item in v
            ]
        else:
            new_doc[k] = v
    return new_doc


# Module-level connection session and cache for Supabase REST API calls
_session = requests.Session()
_supabase_cache = {}

class SupabaseCollection(MockCollection):
    def __init__(self, name, db):
        self.name = name
        self.db = db

    def _get_headers(self):
        return {
            "apikey": self.db.supabase_key,
            "Authorization": f"Bearer {self.db.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def _fetch_all(self):
        try:
            with open("d:\\cli\\time_log.txt", "a") as f_log:
                f_log.write(f"[_fetch_all] {self.name} called. Cache keys: {list(_supabase_cache.keys())}\n")
        except Exception:
            pass
        if self.name in _supabase_cache:
            try:
                with open("d:\\cli\\time_log.txt", "a") as f_log:
                    f_log.write(f"[_fetch_all] {self.name} cache HIT!\n")
            except Exception:
                pass
            return _supabase_cache[self.name]
            
        try:
            with open("d:\\cli\\time_log.txt", "a") as f_log:
                f_log.write(f"[_fetch_all] {self.name} cache MISS. Fetching from Supabase...\n")
        except Exception:
            pass
        t0 = time.time()
        url = f"{self.db.supabase_url}/rest/v1/collections"
        params = {"collection_name": f"eq.{self.name}"}
        try:
            r = _session.get(url, headers=self._get_headers(), params=params)
            duration = time.time() - t0
            try:
                with open("d:\\cli\\time_log.txt", "a") as f_log:
                    f_log.write(f"[_fetch_all] {self.name} fetch done in {duration:.3f}s. Status: {r.status_code}\n")
            except Exception:
                pass
            if r.status_code == 200:
                rows = r.json()
                docs = []
                for row in rows:
                    doc = row.get("data", {})
                    # Standardize BSON style _id
                    if "_id" not in doc:
                        doc["_id"] = row.get("document_id")
                    elif isinstance(doc["_id"], dict) and "$oid" in doc["_id"]:
                        doc["_id"] = doc["_id"]["$oid"]
                    docs.append(doc)
                _supabase_cache[self.name] = docs
                return docs
            else:
                logger.error(f"Supabase REST fetch error: Status {r.status_code}, Response: {r.text}")
        except Exception as e:
            logger.error(f"Supabase GET connection error: {e}")
        return []

    def find(self, query=None):
        query = query or {}
        all_docs = self._fetch_all()
        res = MockCursor()
        for doc in all_docs:
            if self._matches(doc, query):
                res.append(doc.copy())
        return res

    def insert_one(self, doc):
        _supabase_cache.pop(self.name, None)
        doc = clean_mongo_doc(doc.copy())
        if "_id" not in doc:
            doc["_id"] = str(ObjectId())
        
        doc_id = doc["_id"]
        payload = {
            "id": f"{self.name}:{doc_id}",
            "collection_name": self.name,
            "document_id": doc_id,
            "data": doc
        }
        
        url = f"{self.db.supabase_url}/rest/v1/collections"
        headers = self._get_headers()
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        
        try:
            r = _session.post(url, headers=headers, json=payload)
            if r.status_code not in (200, 201):
                logger.error(f"Supabase REST insert error: Status {r.status_code}, Response: {r.text}")
        except Exception as e:
            logger.error(f"Supabase POST connection error: {e}")
            
        class InsertOneResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertOneResult(doc_id)

    def insert_many(self, docs):
        _supabase_cache.pop(self.name, None)
        inserted_ids = []
        payloads = []
        for doc in docs:
            doc = clean_mongo_doc(doc.copy())
            if "_id" not in doc:
                doc["_id"] = str(ObjectId())
            doc_id = doc["_id"]
            inserted_ids.append(doc_id)
            payloads.append({
                "id": f"{self.name}:{doc_id}",
                "collection_name": self.name,
                "document_id": doc_id,
                "data": doc
            })
            
        if payloads:
            url = f"{self.db.supabase_url}/rest/v1/collections"
            headers = self._get_headers()
            headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            try:
                r = _session.post(url, headers=headers, json=payloads)
                if r.status_code not in (200, 201):
                    logger.error(f"Supabase REST insert_many error: Status {r.status_code}, Response: {r.text}")
            except Exception as e:
                logger.error(f"Supabase POST connection error: {e}")
                
        class InsertManyResult:
            def __init__(self, ids):
                self.inserted_ids = ids
        return InsertManyResult(inserted_ids)

    def update_one(self, query, update, upsert=False):
        _supabase_cache.pop(self.name, None)
        docs = self.find(query)
        if not docs:
            if upsert:
                new_doc = query.copy()
                if "$set" in update:
                    new_doc.update(update["$set"])
                self.insert_one(new_doc)
            return

        target_doc = docs[0].copy()
        if "$set" in update:
            target_doc.update(update["$set"])

        target_doc = clean_mongo_doc(target_doc)
        doc_id = target_doc["_id"]
        
        url = f"{self.db.supabase_url}/rest/v1/collections"
        params = {"id": f"eq.{self.name}:{doc_id}"}
        headers = self._get_headers()
        try:
            r = _session.patch(url, headers=headers, params=params, json={"data": target_doc})
            _supabase_cache.pop(self.name, None)
            if r.status_code not in (200, 204):
                logger.error(f"Supabase REST update_one error: Status {r.status_code}, Response: {r.text}")
        except Exception as e:
            _supabase_cache.pop(self.name, None)
            logger.error(f"Supabase PATCH connection error: {e}")

    def update_many(self, query, update):
        _supabase_cache.pop(self.name, None)
        docs = self.find(query)
        if not docs:
            return
            
        payloads = []
        for doc in docs:
            target_doc = doc.copy()
            if "$set" in update:
                target_doc.update(update["$set"])
            target_doc = clean_mongo_doc(target_doc)
            doc_id = target_doc["_id"]
            payloads.append({
                "id": f"{self.name}:{doc_id}",
                "collection_name": self.name,
                "document_id": doc_id,
                "data": target_doc
            })
            
        if payloads:
            url = f"{self.db.supabase_url}/rest/v1/collections"
            headers = self._get_headers()
            headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            try:
                r = _session.post(url, headers=headers, json=payloads)
                _supabase_cache.pop(self.name, None)
                if r.status_code not in (200, 201):
                    logger.error(f"Supabase REST update_many error: Status {r.status_code}, Response: {r.text}")
            except Exception as e:
                _supabase_cache.pop(self.name, None)
                logger.error(f"Supabase POST connection error: {e}")

    def delete_one(self, query):
        _supabase_cache.pop(self.name, None)
        doc = self.find_one(query)
        deleted_count = 0
        if doc:
            doc_id = doc["_id"]
            url = f"{self.db.supabase_url}/rest/v1/collections"
            params = {"id": f"eq.{self.name}:{doc_id}"}
            try:
                r = _session.delete(url, headers=self._get_headers(), params=params)
                _supabase_cache.pop(self.name, None)
                if r.status_code in (200, 204):
                    deleted_count = 1
                else:
                    logger.error(f"Supabase REST delete_one error: Status {r.status_code}, Response: {r.text}")
            except Exception as e:
                _supabase_cache.pop(self.name, None)
                logger.error(f"Supabase DELETE connection error: {e}")
                
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(deleted_count)

    def delete_many(self, query):
        _supabase_cache.pop(self.name, None)
        docs = self.find(query)
        deleted_count = 0
        if docs:
            doc_ids = [d["_id"] for d in docs]
            id_list_str = ",".join([f"{self.name}:{did}" for did in doc_ids])
            url = f"{self.db.supabase_url}/rest/v1/collections"
            params = {"id": f"in.({id_list_str})"}
            try:
                r = _session.delete(url, headers=self._get_headers(), params=params)
                _supabase_cache.pop(self.name, None)
                if r.status_code in (200, 204):
                    deleted_count = len(doc_ids)
                else:
                    logger.error(f"Supabase REST delete_many error: Status {r.status_code}, Response: {r.text}")
            except Exception as e:
                _supabase_cache.pop(self.name, None)
                logger.error(f"Supabase DELETE connection error: {e}")
                
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(deleted_count)

class SupabaseDB:
    def __init__(self, url, key):
        self.supabase_url = url.rstrip("/")
        self.supabase_key = key

    def __getattr__(self, name):
        return SupabaseCollection(name, self)


# Initialize Database Connection (Prioritize Supabase if configured)
supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY

use_supabase = False
if supabase_url and supabase_key:
    if "supabase.co" in supabase_url and not supabase_url.startswith("your_"):
        use_supabase = True

db = None
if use_supabase:
    logger.info(f"Attempting connection to Supabase REST database API at: {supabase_url}")
    try:
        test_headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}"
        }
        r = requests.get(f"{supabase_url}/rest/v1/collections?limit=1", headers=test_headers, timeout=3.0)
        if r.status_code == 200:
            db = SupabaseDB(supabase_url, supabase_key)
            logger.info("Connected to Supabase database successfully.")
        elif r.status_code == 404:
            logger.warning("Supabase URL & Key are loaded, but the 'collections' table does not exist in your Supabase database.")
            logger.warning("Please run the SQL schema creation command in your Supabase dashboard.")
            logger.warning("Falling back to local MongoDB / MockDB...")
        else:
            logger.warning(f"Supabase connection check returned status {r.status_code}: {r.text}")
            logger.warning("Falling back to local MongoDB / MockDB...")
    except Exception as e:
        logger.warning(f"Unable to connect to Supabase database REST endpoint: {e}")
        logger.warning("Falling back to local MongoDB / MockDB...")

if db is None:
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite") or db_url.startswith("postgresql"):
        db_url = "mongodb://localhost:27017/studlyf"

    logger.info(f"Attempting connection to MongoDB at: {db_url}")
    try:
        client = MongoClient(db_url, serverSelectionTimeoutMS=1500)
        client.admin.command('ping')
        db = client.get_database()
        logger.info("Connected to MongoDB database successfully.")
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        logger.warning(f"Unable to connect to live MongoDB service: {e}")
        logger.warning("STUDLYF Backend is falling back to an In-Memory Mock Database client...")
        db = MockDB()

class AliasDBWrapper:
    def __init__(self, db_client):
        self._db = db_client

    def __getattr__(self, name):
        # Mapped legacy collection names to standard collection names
        COLLECTION_ALIASES = {
            "profiles": "startup_profiles",
            "roadmap_tasks": "roadmaps",
            "funding_schemes": "funding_programs",
            "contacts": "network_contacts",
            "job_opportunities": "opportunities",
            "job_applications": "applications",
            "chat_history": "copilot_chats"
        }
        target_name = COLLECTION_ALIASES.get(name, name)
        return getattr(self._db, target_name)

    def __getitem__(self, name):
        COLLECTION_ALIASES = {
            "profiles": "startup_profiles",
            "roadmap_tasks": "roadmaps",
            "funding_schemes": "funding_programs",
            "contacts": "network_contacts",
            "job_opportunities": "opportunities",
            "job_applications": "applications",
            "chat_history": "copilot_chats"
        }
        target_name = COLLECTION_ALIASES.get(name, name)
        if hasattr(self._db, "__getitem__"):
            return self._db[target_name]
        return getattr(self._db, target_name)

db = AliasDBWrapper(db)

def get_db():
    """Dependency provider yielding the active Database client."""
    return db
