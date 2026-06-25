import os
import pandas as pd
import fitz  # PyMuPDF
from typing import List, Dict, Any
from backend.core.logger import logger

class FileParser:
    @staticmethod
    def parse_linkedin_csv(file_path: str) -> List[Dict[str, Any]]:
        """Parses a LinkedIn connections export CSV using Pandas and returns a list of contact dicts."""
        if not os.path.exists(file_path):
            logger.error(f"CSV file not found: {file_path}")
            return []
            
        try:
            # LinkedIn exports typically have metadata in the first 3 lines,
            # so we try to load with skiprows=3 or detect the header
            df = pd.read_csv(file_path, skiprows=3)
            
            # Clean column names
            df.columns = df.columns.str.strip()
            
            # Required columns standard mapping
            contacts = []
            for _, row in df.iterrows():
                first_name = row.get("First Name", "")
                last_name = row.get("Last Name", "")
                company = row.get("Company", "")
                email = row.get("Email Address", "")
                position = row.get("Position", "")
                
                if pd.notna(first_name) or pd.notna(last_name):
                    name = f"{first_name} {last_name}".strip()
                    contacts.append({
                        "name": name,
                        "company": company if pd.notna(company) else "Independent",
                        "email": email if pd.notna(email) and email != "" else None,
                        "position": position if pd.notna(position) else "N/A"
                    })
            logger.info(f"Successfully parsed {len(contacts)} contacts from LinkedIn CSV.")
            return contacts
        except Exception as e:
            logger.error(f"Error parsing LinkedIn CSV with Pandas: {str(e)}")
            # Fallback to simple parse if CSV format is standard
            try:
                df = pd.read_csv(file_path)
                contacts = []
                for _, row in df.iterrows():
                    name = row.get("Name", row.get("name", ""))
                    email = row.get("Email", row.get("email", ""))
                    company = row.get("Company", row.get("company", ""))
                    if pd.notna(name) and name != "":
                        contacts.append({
                            "name": name,
                            "company": company if pd.notna(company) else "N/A",
                            "email": email if pd.notna(email) else None,
                            "position": row.get("Position", "N/A")
                        })
                return contacts
            except Exception as e2:
                logger.error(f"Fallback parse failed: {str(e2)}")
                return []

    @staticmethod
    def extract_pdf_text(file_path: str) -> str:
        """Extracts plain text contents from a PDF file using PyMuPDF (fitz) for resume/pitch deck processing."""
        if not os.path.exists(file_path):
            logger.error(f"PDF file not found: {file_path}")
            return ""
            
        try:
            doc = fitz.open(file_path)
            full_text = []
            for page in doc:
                text = page.get_text()
                if text:
                    full_text.append(text)
            doc.close()
            logger.info(f"Successfully extracted {len(full_text)} pages of text from PDF: {file_path}")
            return "\n".join(full_text)
        except Exception as e:
            logger.error(f"Error extracting PDF text with PyMuPDF: {str(e)}")
            return ""
