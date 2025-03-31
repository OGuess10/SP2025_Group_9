## Get started

1. Install requirements

   ```bash
      pip install -r requirements.txt
   ```

3. Set up database:
   ```mkdir -p db
      touch db/database.db
   ```
   Recommend downloading SQL editor or viewer extension on VS code
4. SMTP setup (emai sender)
   Ask Mijung for GMAIL_PW 

2. Run server
   ```flask run
   ```

3. Run ngrok
   Create an ngrok account if you do not have one and follow setup instructions: https://ngrok.com/

   Then run
   ````ngrok http 5000
   ````

   Go to endpoints on the ngrok website and copy the url
   Paste the url in frontend/.env as EXPO_PUBLIC_API_URL
   Do not include quotations or semicolons

## Activate Virtual environment (if necessary)
    
   ```python3 -m venv venv
      source venv/bin/activate
   ```