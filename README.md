# Setup

Run nginx in a minikube k8s cluster.
* port 8081 serves the normal welcome nginx page
* port 8082 serves a slow response (rate limited to 200 bytes/s) of the page

```bash
minikube start

kubectl apply -f nginx/nginx.yaml

kubectl port-forward service/nginx  8081:8081

kubectl port-forward service/nginx  8082:8082
```

# Run k6

```bash
brew install k6

k6 run -e hostname=localhost k6/test-all.js
k6 run -e hostname=localhost k6/test-slow.js
```

# Install Testkube

```bash
brew install testkube
kubectl testkube install --namespace default
kubectl testkube config namespace default
kubectl get pods -n testkube
```

# Create tests
```bash
kubectl testkube create test --file k6/test-all.js --name k6-test-all
kubectl testkube create test --file k6/test-slow.js --name k6-test-slow
kubectl testkube get test
kubectl testkube run test  k6-test-all -f
kubectl testkube run test  k6-test-slow -f
```


# Add test from github
```bash
kubectl apply -f k6/k6-executor.yaml
kubectl testkube create test --git-uri https://github.com/ericfuxealth/testkube.git --git-branch main --git-path k6 --type "k6/script" --name k6-test-git
kubectl testkube get test k6-test-git
```

# Run test from github

```bash
kubectl testkube run test k6-test-git --args k6/test-all.js --watch
kubectl testkube run test k6-test-git --args k6/test-slow.js --watch
```

# Create test from Postman

```bash
kubectl testkube create test --name k6-test-postman --file postman/k6.test-normal.json --type postman/collection

kubectl testkube get test k6-test-postman

kubectl testkube run test k6-test-postman --watch
```

# Run Postman test from github

```bash
kubectl testkube create test --git-uri https://github.com/ericfuxealth/testkube.git --git-branch main --git-path postman --type "postman/collection" --name k6-test-postman-git
```
TODO: this doesn't work
```
kubectl testkube run test k6-test-postman-git  --watch
```

# Sync test with ArgoCD
See https://kubeshop.io/blog/a-gitops-powered-kubernetes-testing-machine-with-argocd-and-testkube

Install ArgoCD
See https://argo-cd.readthedocs.io/en/stable/getting_started/

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
kubectl port-forward svc/argocd-server -n argocd 8080:443
open http://localhost:8080
```

Install TestKube plugin
```bash
kubectl patch deployments.apps -n argocd argocd-repo-server --type json --patch-file ./argocd/patch.yml

kubectl patch -n argocd configmaps argocd-cm --patch-file argocd/argocd-plugins.yml

kubectl apply -f argocd/testkube-application.yml

```

TODO: didn't work: argocd error:
```bash
rpc error: code = Unknown desc = Manifest generation error (cached): `bash -c testkube generate tests-crds .` failed exit status 1

```


# Dashboard
```bash
kubectl testkube dashboard -s default

```



# Clean up
```bash
kubectl delete jobs `kubectl get jobs -o custom-columns=:.metadata.name`
```
