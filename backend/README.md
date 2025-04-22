## Get started

1. Install requirements

   ```
      bash
      pip install -r requirements.txt
   ```

2. Set up database:
   ```
      mkdir -p db
      touch db/database.db
   ```
   Recommend downloading SQL editor or viewer extension on VS code
3. SMTP setup (emai sender)
   Ask Mijung for GMAIL_PW 

4. Run backend through docker. (First go to root repo)
   ```
      docker compose build
      docker compose up
   ```


5. Run ngrok
   Create an ngrok account if you do not have one and follow setup instructions: https://ngrok.com/

   Then run
   ```
      ngrok http 8080
   ```

6. Run Kubernetes
   

Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [kind](https://kind.sigs.k8s.io/) installed (Kubernetes in Docker)


   Then run
   ```
      kind create cluster --config k8s/kind-cluster.yaml
      kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml

      cd backend           #Make sure you are in backend
      docker build -t group9-backend:v1.6 .
      kind load docker-image group9-backend:v1.6
      cd ..             #MAke sure you are in root project
   ```

   Make sure that k8s/deployment.yaml has  (or the image you built in docker)
   image: group9-backend:v1.6
   imagePullPolicy: Never

   Then run
   ````
         kubectl apply -f k8s/deployment.yaml
         kubectl apply -f k8s/ingress.yaml
         kubectl delete pod -l app=flask-backend
         kubectl get pods -w
   ````
   Open http://localhost:8080 


   Go to endpoints on the ngrok website and copy the url
   Paste the url in frontend/.env as EXPO_PUBLIC_API_URL
   Do not include quotations or semicolons

## Activate Virtual environment (if necessary)
    
   ```
      python3 -m venv venv
      source venv/bin/activate
   ```