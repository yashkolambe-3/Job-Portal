# CareerConnect AI

CareerConnect AI is a job portal for candidates, recruiters, and administrators. Candidates manage profiles and resumes, search and save jobs, and track applications. Recruiters maintain company profiles, publish jobs, and review applicants. Administrators manage users, recruiter verification, and job moderation.

Existing features include JWT-based role access, profile and resume management, job search and applications, recruiter applicant tracking, admin moderation, and deterministic profile scoring/job matching. Optional SMTP notifications are disabled when mail settings are blank.

## Technologies

- Frontend: React 19, Vite 8, React Router, Axios, Tailwind CSS.
- Backend: Node.js, Express 5, JWT, bcryptjs, Multer, Nodemailer.
- Database: MySQL 8 with `mysql2`.
- DevOps: GitHub, Jenkins, Docker, Docker Hub, Kubernetes, Microsoft Azure AKS.

## Architecture

```text
Developer -> GitHub -> Jenkins -> npm checks and API smoke test
                               -> Docker build -> Docker Hub
                               -> kubectl deploy -> Azure AKS
                                                        |
Browser <- public frontend LoadBalancer <- frontend pod  |
                                      -> internal API service -> backend pod
                                                              -> MySQL service -> MySQL pod/PVC
```

The frontend and API are separate containers. Kubernetes exposes only the frontend. Vite proxies `/api` requests to the internal backend service, so the browser does not need a public database or API address. For the capstone demonstration, MySQL runs as one in-cluster pod with a persistent volume; this keeps setup simple and avoids a separate managed database service. Uploaded resumes also use a persistent volume. This single-node layout has no database high availability or managed backups; a production deployment should use a managed MySQL service and a recovery plan.

## Project Structure

```text
backend/                 Express API, routes, services, schema, smoke test
frontend/                React/Vite application and Dockerfile
docs/                    College demonstration and viva notes
k8s/                     Kubernetes ConfigMap, Deployments, Services, PVCs
docker-compose.yml        Local MySQL, API, and frontend containers
Jenkinsfile               CI/CD pipeline
careerconnect_backup.sql Database backup; do not use in deployment without reviewing its user data
```

## Run Locally

Requirements: Node.js 20.19+ or 22.12+, npm, and MySQL 8. The frontend and backend lockfiles are used with `npm ci`.

For a local MySQL installation, create a database, apply the schema, and configure `backend/.env` from its example. Keep a unique `JWT_SECRET` private.

```powershell
mysql -u root -p -e "CREATE DATABASE careerconnect_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
Get-Content -Raw backend/database/schema.sql | mysql -u root -p careerconnect_ai
Copy-Item backend/.env.example backend/.env
```

Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=careerconnect_ai`, and a strong `JWT_SECRET` in `backend/.env`. In separate PowerShell windows:

Public registration intentionally does not create administrator accounts. Provision an admin through a trusted database administrator using a `bcryptjs` password hash; do not insert a plaintext password.

```powershell
Set-Location backend
npm ci
npm run dev
```

```powershell
Set-Location frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. The default local API URL is `http://localhost:5000/api/v1`.

## Docker

The existing `backend/Dockerfile` and `frontend/Dockerfile` are reused. The frontend image builds the Vite assets and then runs the existing Vite server; this preserves the current capstone container behavior. A production deployment should serve the built assets through a production web server.

For Compose, copy `.env.example` to `.env` and set `MYSQL_ROOT_PASSWORD`. If reusing a MySQL volume, this value must match the password with which that volume was initialized; for a new volume, use a unique value. Copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET` and any optional SMTP settings. Compose supplies the database connection values to the API and applies `backend/database/schema.sql` to a fresh MySQL volume. The local Compose setup retains its existing root database user for volume compatibility; AKS uses a separate app user.

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
# Edit both local files before starting containers.
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f backend frontend
```

The frontend is at `http://localhost:5173`, the API health endpoint at `http://localhost:5000/health`, and host MySQL at port `3307`. Do not run `docker compose down -v` unless you intend to permanently delete the local database volume.

## Tests

From `frontend/`, run `npm ci`, `npm run lint`, and `npm run build`. From `backend/`, run `npm ci` and `npm run test:smoke`. The smoke test creates and drops a temporary database, so its MySQL account needs `CREATE DATABASE` and `DROP DATABASE` privileges. Jenkins starts a disposable MySQL 8 container and generates a fresh random password for each build.

## API Overview

Application endpoints use `/api/v1`: `/auth`, `/candidate`, `/resumes`, `/jobs`, `/applications`, `/saved-jobs`, `/recruiter/company`, `/recruiter/jobs`, `/admin`, and `/ai`. `/health` checks API availability; `/api/v1/test-db` checks MySQL connectivity. Career scoring and recommendations use the existing deterministic implementation and do not need an external AI key.

## Jenkins and CI/CD

Create a Jenkins Pipeline job pointing to this repository and `Jenkinsfile`. Install the Pipeline, Git, GitHub, and Credentials Binding plugins. The Jenkins agent needs Node.js/npm, Docker Engine access, `kubectl`, `kubelogin`, and Azure CLI. The pipeline checks out code, installs locked dependencies, runs frontend lint/build and the backend smoke test, builds both existing Dockerfiles, pushes versioned images to Docker Hub, and deploys the branch selected by `DEPLOY_BRANCH` to AKS.

The Pipeline shows separate Checkout, Install Dependencies, Run Tests, Build Application, Build Docker Images, Push Docker Images, and Deploy to AKS stages. Images receive the tag `<BUILD_NUMBER>-<7-character-commit>` and are also tagged `latest` for manual Compose use. Kubernetes is updated to the unique version tag, not `latest`. Set `DEPLOY_BRANCH` to the GitHub deployment branch (default `main`). The Jenkins build parameter `DOCKER_USERNAME` sets the Docker Hub namespace and must match the username stored in `dockerhub-credentials`.

Create these Jenkins credentials:

| Credential ID | Jenkins type | Purpose |
| --- | --- | --- |
| `dockerhub-credentials` | Username with password (use a Docker Hub access token as the password) | Authenticate image push to Docker Hub. Username must match the `DOCKER_USERNAME` build parameter. |
| `azure-service-principal` | Username with password | Azure client ID as username and client secret as password for AKS deployment. |
| `github-checkout` | Username with password; only for a private repository | Read-only GitHub checkout token, if Jenkins cannot access the repository anonymously. |

In Jenkins, open **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**. Select the type shown above, enter the exact ID, and save. For Docker Hub, create an access token in Docker Hub and use that token as the Jenkins password. Create the GitHub credential only if the repository is private.

Set these non-secret Jenkins environment variables for the deployment stage: `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AKS_RESOURCE_GROUP`, and `AKS_CLUSTER_NAME`. The service principal needs the Azure Kubernetes Service Cluster User Role on the cluster and Azure Kubernetes Service RBAC Writer in the `default` namespace. The pipeline logs into Docker Hub with `docker login --password-stdin` and uses Azure CLI service-principal login; credentials are never stored in this repository.

### GitHub Webhook

For a Pipeline job, enable **GitHub hook trigger for GITScm polling** in the job configuration. Add a GitHub repository webhook whose payload URL is `https://<public-jenkins-host>/github-webhook/`, content type is `application/json`, and event is **Just the push event**. Jenkins must be reachable by GitHub over HTTPS. For a private repo, add the `github-checkout` credential to the job's SCM configuration. Without a reachable webhook, use **Build Now** for the demonstration.

### Docker Hub

Sign in to Docker Hub, open **My Hub → Repositories → Create repository**, and create public repositories named `careerconnect-backend` and `careerconnect-frontend` under your Docker Hub username. Public repositories keep AKS image pulls simple for the college demo. Set the Jenkins `DOCKER_USERNAME` parameter to that username; the pipeline checks it against the credential before pushing. If you choose private repositories, configure an `imagePullSecret` in the cluster and reference it from the pod specs.

## Kubernetes

The manifests create one MySQL Deployment, one API Deployment, one frontend Deployment, internal ClusterIP Services for MySQL and API, a public LoadBalancer for the frontend, and persistent claims for MySQL and resume uploads. The API reads database credentials and `JWT_SECRET` from a Kubernetes Secret. No secret manifest or credential value is committed. Kubernetes Secrets remain sensitive cluster data; limit access through RBAC and do not treat their base64 representation as encryption.

Before applying manifests, create the Secret and schema ConfigMap. The following commands use masked PowerShell prompts and keep values out of YAML files and command history. Use the same database username/password for the MySQL-created application user and API connection.

```powershell
function Read-SecretText([string]$Prompt) {
  $secureValue = Read-Host -Prompt $Prompt -AsSecureString
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
$env:MYSQL_ROOT_PASSWORD = Read-SecretText "MySQL root password"
$env:DB_PASSWORD = Read-SecretText "CareerConnect database password"
$env:JWT_SECRET = Read-SecretText "JWT secret"
kubectl create secret generic careerconnect-secrets `
  --from-literal=MYSQL_ROOT_PASSWORD="$env:MYSQL_ROOT_PASSWORD" `
  --from-literal=DB_USER=careerconnect_app `
  --from-literal=DB_PASSWORD="$env:DB_PASSWORD" `
  --from-literal=JWT_SECRET="$env:JWT_SECRET"
kubectl create configmap careerconnect-schema `
  --from-file=01-schema.sql=backend/database/schema.sql `
  --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s
```

The manifests start with the existing Docker Hub namespace. For a different namespace or a freshly built image, update the images using `kubectl set image` with the versioned tags. Verify with:

```powershell
kubectl get nodes
kubectl get deployments
kubectl get pods
kubectl get services
kubectl logs deployment/careerconnect-backend
```

For local Kubernetes on Windows, Docker Desktop Kubernetes is the easiest option if Docker Desktop is installed. Enable Kubernetes in Docker Desktop settings, then run `kubectl config use-context docker-desktop` and the commands above. Alternatively, install Minikube and run `minikube start --driver=docker --cpus=2 --memory=4096`, then `kubectl config use-context minikube`. If `kubectl` is missing, install Azure CLI and run `az aks install-cli`, or install `kubectl` separately. Wait for pods and PVCs to become ready. Open the app with `minikube service careerconnect-frontend --url`; keep the service tunnel command running while testing. A cluster without a default StorageClass cannot bind the two PVCs.

Do not create the Azure cluster until the local cluster shows all three Deployments and Pods ready, both PVCs bound, and the application opens through the frontend Service.

## Microsoft Azure AKS

**Cost warning:** AKS Free tier has no cluster-management charge, but Azure bills for the worker VM, persistent disks, public load balancer/IP, and network traffic. Azure managed disk billing uses disk SKUs with a 32 GiB minimum even when the PVC requests less. Charges continue until resources are deleted. Azure for Students credits are conditional on eligibility and remaining credit; verify your account in the Azure portal before creating resources. See Microsoft's [AKS pricing tiers](https://learn.microsoft.com/en-us/azure/aks/free-standard-pricing-tiers), [AKS disk storage details](https://learn.microsoft.com/en-us/azure/aks/create-volume-azure-disk), and [Azure for Students eligibility](https://azure.microsoft.com/en-us/free/students/).

Sign in, select a subscription, and create a dedicated resource group. A single `Standard_B2s` node is a low-cost demonstration starting point, subject to regional availability and quota. Azure may require a different VM size in your region.

```powershell
az login
az account list --output table
$subscriptionId = Read-Host "Subscription ID"
az account set --subscription $subscriptionId
az aks install-cli
$resourceGroup = "rg-careerconnect-demo"
$location = "centralindia"
$clusterName = "aks-careerconnect-demo"
az group create --name $resourceGroup --location $location
az aks create --resource-group $resourceGroup --name $clusterName --location $location `
  --tier free --node-count 1 --node-vm-size Standard_B2s `
  --enable-aad --enable-azure-rbac --generate-ssh-keys --yes
$clusterId = az aks show --resource-group $resourceGroup --name $clusterName --query id --output tsv
$currentUserId = az ad signed-in-user show --query id --output tsv
az role assignment create --assignee-object-id $currentUserId --assignee-principal-type User `
  --role "Azure Kubernetes Service Cluster User Role" --scope $clusterId
az role assignment create --assignee-object-id $currentUserId --assignee-principal-type User `
  --role "Azure Kubernetes Service RBAC Cluster Admin" --scope $clusterId
az aks get-credentials --resource-group $resourceGroup --name $clusterName
kubelogin convert-kubeconfig -l azurecli
kubectl get nodes
```

The current Azure identity needs permission to create role assignments. If your account cannot assign roles, ask the subscription administrator to grant these two roles. Role assignments can take several minutes to propagate. The Jenkins agent must be able to reach the AKS API endpoint over the network.

Create an Entra service principal for Jenkins after the cluster exists. The assignment step requires permission to assign roles. Keep the returned client secret in Jenkins only.

```powershell
$clusterId = az aks show --resource-group $resourceGroup --name $clusterName --query id --output tsv
$sp = az ad sp create-for-rbac --name "careerconnect-jenkins" --skip-assignment | ConvertFrom-Json
$spObjectId = az ad sp show --id $sp.appId --query id --output tsv
$namespaceScope = "$clusterId/namespaces/default"
az role assignment create --assignee-object-id $spObjectId --assignee-principal-type ServicePrincipal `
  --role "Azure Kubernetes Service Cluster User Role" --scope $clusterId
az role assignment create --assignee-object-id $spObjectId --assignee-principal-type ServicePrincipal `
  --role "Azure Kubernetes Service RBAC Writer" --scope $namespaceScope
```

Add `$sp.appId` as the Jenkins credential username, `$sp.password` as its password, and set the tenant and subscription IDs in Jenkins job configuration. Then create the Kubernetes secret/configmap from the preceding section and apply the manifests. Jenkins will update the deployments on a successful push to the selected `DEPLOY_BRANCH`.

Wait for external IP and rollout:

```powershell
kubectl get pods --watch
kubectl get deployments
kubectl get services
kubectl rollout status deployment/careerconnect-backend
kubectl rollout status deployment/careerconnect-frontend
```

Open `http://<EXTERNAL-IP>` from the `careerconnect-frontend` Service. This is the final deployment URL; it will be known after Azure provisions the LoadBalancer. The API health check is reachable inside the cluster at `http://careerconnect-backend:5000/health`.

To stop billing after the demonstration, confirm the resource group name and delete only the dedicated demo group:

```powershell
az group delete --name $resourceGroup --yes --no-wait
```

This removes every resource in that group, including the cluster and disks. Export any data you need first.

## Environment Variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | API | HTTP port; defaults to `5000`. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | API | MySQL connection. Keep passwords in ignored local env files or Kubernetes Secrets. |
| `JWT_SECRET` | API | Signs authentication tokens; use a unique random value and keep it private. |
| `CORS_ORIGIN` | API | Optional comma-separated allowed origins for direct browser-to-API deployments. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `EMAIL_SECURE` | API | Optional SMTP notifications. |
| `VITE_API_BASE_URL` | Frontend | API base including `/api/v1`; use localhost for direct local development and `/api/v1` behind the container proxy. It is public frontend configuration, never a secret. |
| `BACKEND_URL` | Vite server | Backend target for the `/api` proxy; Docker Compose uses `http://backend:5000`, Kubernetes uses `http://careerconnect-backend:5000`. |
| `MYSQL_ROOT_PASSWORD` | Compose | Local MySQL root password from the ignored project `.env` file. |

The existing deterministic career tools do not call an external AI service and need no AI API key. Blank SMTP settings disable email.

## Troubleshooting

- Compose reports a missing `MYSQL_ROOT_PASSWORD`: create the ignored root `.env` from `.env.example` and set the value. For an existing MySQL volume, use its current password.
- API reports a database connection failure: check `docker compose ps`, `docker compose logs mysql`, and confirm the Compose database/user/password values.
- Running the backend smoke test directly on Windows reports `ENOTFOUND host.docker.internal`: for a host-run test, set `DB_HOST=127.0.0.1`; if MySQL is published by this Compose file, set `DB_PORT=3307`. Compose itself overrides the API connection to `mysql:3306`.
- Frontend cannot reach the API in a container: verify `VITE_API_BASE_URL=/api/v1`, the `BACKEND_URL` service DNS name, and that `careerconnect-backend` is ready.
- A Kubernetes pod is pending: run `kubectl describe pod <pod-name>` and `kubectl get pvc`; a missing StorageClass or unbound claim is a common cause.
- A pod is restarting: run `kubectl logs deployment/<deployment-name> --previous` and `kubectl describe pod <pod-name>`.
- AKS image pull fails: confirm both Docker Hub repositories are public or configure an `imagePullSecret`, then check `kubectl describe pod` events.
- `LoadBalancer` has no external IP: wait a few minutes and run `kubectl get service careerconnect-frontend --watch`.
- Jenkins deployment fails authentication: check credential IDs, service-principal role assignments, tenant/subscription variables, and `az aks get-credentials` output.
- PowerShell `npm` reports a missing `npm-cli.js`: run `where.exe node`, `where.exe npm`, `node --version`, and `npm --version`; repair the Node.js/npm installation and open a new PowerShell session.

Useful commands:

```powershell
docker compose logs --tail 100 backend frontend mysql
kubectl get all
kubectl describe deployment careerconnect-backend
kubectl logs deployment/careerconnect-backend --tail=100
kubectl get events --sort-by=.lastTimestamp
az aks show --resource-group $resourceGroup --name $clusterName --output table
```

## College Screenshots

Capture the GitHub repository and webhook, Dockerfiles and running Compose containers, Jenkins stage view, Docker Hub versioned tags, Kubernetes nodes/pods/deployments/services, the AKS overview, the frontend Service external IP, and the live application. Hide credential values and personal records in screenshots.

## Final Deployment URL

Pending AKS provisioning. After the frontend Service receives an external IP, record `http://<EXTERNAL-IP>` here for the college submission.
