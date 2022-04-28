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

kubectl testkube tests run test k6-test-postman --watch
```

# Run Postman test from github

```bash
kubectl testkube create test --git-uri https://github.com/ericfuxealth/testkube.git --git-branch main --git-path postman --type "postman/collection" --name k6-test-postman-git

kubectl testkube tests run test k6-test-postman-git --args postman/k6.test-normal.json --watch
```

# Dashboard
```bash
kubectl testkube dashboard -s default

```



# Clean up
```bash
kubectl delete jobs `kubectl get jobs -o custom-columns=:.metadata.name`
```
