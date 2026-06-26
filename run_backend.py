import sys
import subprocess
import os

def check_and_install_dependencies():
    print("Checking backend Python dependencies...")
    try:
        import fastapi
        import uvicorn
        import pymongo
        import pydantic
        print("Required dependencies already installed!")
    except ImportError:
        print("Missing core dependencies. Installing requirements from backend/requirements.txt...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"],
                check=True
            )
            print("Dependencies successfully installed!")
        except subprocess.CalledProcessError as e:
            print(f"Error installing dependencies: {e}")
            sys.exit(1)

def main():
    check_and_install_dependencies()
    
    # Set PythonPath to include the root directory so imports resolve correctly
    os.environ["PYTHONPATH"] = os.getcwd()
    
    # Run uvicorn on port 3002 (which Vite proxies /api to from 3001)
    print("Starting STUDLYF FastAPI backend on http://localhost:3002 ...")
    try:
        import uvicorn
        uvicorn.run("backend.main:app", host="127.0.0.1", port=3002, reload=True)
    except KeyboardInterrupt:
        print("\nBackend stopped.")
    except Exception as e:
        print(f"Failed to start backend: {e}")

if __name__ == "__main__":
    main()
