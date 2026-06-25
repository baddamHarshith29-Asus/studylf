import time
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
from backend.core.config import settings

# Attempt to import PyJWT, fallback to safe base64/hmac mock for dev if not present
try:
    import jwt
    HAS_JWT = True
except ImportError:
    import base64
    import hmac
    import hashlib
    import json
    HAS_JWT = False

# Attempt to import bcrypt directly, avoiding buggy passlib wrapper compatibility issues
try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    import hashlib
    import uuid
    HAS_BCRYPT = False


# Password Utilities
def hash_password(password: str) -> str:
    if HAS_BCRYPT:
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')
    else:
        # Secure fallback: sha256 with salt
        salt = uuid.uuid4().hex
        hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
        return f"{salt}:{hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    if HAS_BCRYPT:
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            pass
            
    # Fallback/passlib validation compatibility checks
    if ":" in hashed_password:
        try:
            salt, hashed = hashed_password.split(":")
            import hashlib
            test_hashed = hashlib.sha256((plain_password + salt).encode('utf-8')).hexdigest()
            return test_hashed == hashed
        except Exception:
            return False
    return False


# JWT Token Utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    if HAS_JWT:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    else:
        # Fallback base64 token generator with HMAC signature
        payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode, default=str).encode()).decode().rstrip("=")
        sig = hmac.new(
            settings.SECRET_KEY.encode(),
            payload_b64.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"{payload_b64}.{sig}"

def decode_access_token(token: str) -> Optional[dict]:
    if not token:
        return None
    if HAS_JWT:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except Exception:
            return None
    else:
        # Fallback decoder
        try:
            if "." not in token:
                return None
            payload_b64, sig = token.split(".")
            # Verify signature
            expected_sig = hmac.new(
                settings.SECRET_KEY.encode(),
                payload_b64.encode(),
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(sig, expected_sig):
                return None
            
            # Decode payload
            padding = "=" * (4 - len(payload_b64) % 4)
            decoded_json = base64.urlsafe_b64decode(payload_b64 + padding).decode()
            payload = json.loads(decoded_json)
            
            # Check expiration
            if "exp" in payload:
                # exp is datetime string or timestamp
                exp_val = payload["exp"]
                if isinstance(exp_val, (int, float)):
                    if time.time() > exp_val:
                        return None
                elif isinstance(exp_val, str):
                    exp_dt = datetime.fromisoformat(exp_val.replace("Z", "+00:00"))
                    if datetime.utcnow() > exp_dt.replace(tzinfo=None):
                        return None
            return payload
        except Exception:
            return None
