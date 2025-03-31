## Get started

1. Install requirements

   ```bash
      pip install -r requirements.txt
   ```

2. Set up database:
   ```mkdir -p db
      touch db/database.db
   ```
   Recommend downloading SQL editor or viewer extension on VS code
3. SMTP setup (emai sender)
   Ask Mijung for GMAIL_PW 

4. Run backend through docker
   ```docker-compose build
      docker-compose up
   ```
<<<<<<< Updated upstream
=======


5. Run ngrok
   Create an ngrok account if you do not have one and follow setup instructions: https://ngrok.com/

   Then run
   ````ngrok http 5000
   ````

   Go to endpoints on the ngrok website and copy the url
   Paste the url in frontend/.env as EXPO_PUBLIC_API_URL
   Do not include quotations or semicolons

>>>>>>> Stashed changes
## Activate Virtual environment (if necessary)
    
   ```python3 -m venv venv
      source venv/bin/activate
   ```