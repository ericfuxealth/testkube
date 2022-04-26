# Setup

Run nginx in a minikube k8s cluster.
* port 8080 serves the normal welcome nginx page
* port 8081 serves a slow response (rate limited to 200 bytes/s) of the page

```bash
minikube start

kubectl apply nginx nginx/nginx.yaml

kubectl port-forward service/nginx  8081:8081

kubectl port-forward service/nginx  8080:8080
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
kubectl get pods -n testkube -s default
```

# Create tests
```bash
kubectl testkube create test --file k6/test-all.js --name k6-test-all -s default
kubectl testkube create test --file k6/test-slow.js --name k6-test-slow -s default
kubectl testkube get test -s default
kubectl testkube run test  k6-test-all -f  -s default
kubectl testkube run test  k6-test-slow -f  -s default

```

# Dashboard
TBD
```bash
kubectl port-forward service/testkube-dashboard 8989:80

```

# Add test from github
```bash
kubectl apply -f k6/k6-executor.yaml
kubectl testkube create test --git-uri https://github.com/ericfuxealth/testkube.git --git-branch main --git-path k6 --type "k6/script" --name k6-test-git -s default
kubectl testkube get test k6-test-git t -s default
```

# Run test from github

```bash
kubectl testkube run test k6-test-git --args k6/test-all.js --watch  -s default
kubectl testkube run test k6-test-git --args k6/test-slow.js --watch  -s default
```


# Clean up
```bash
kubectl delete jobs `kubectl get jobs -o custom-columns=:.metadata.name`
```
