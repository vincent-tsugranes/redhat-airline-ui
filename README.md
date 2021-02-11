Red Hat Airline is a fictional airline build to demonstrate cool technology for airlines and the transportation sector.

It is made up of microservices written in Typescript, containerized and deployed on Openshift

The front-end used Typescript and Vue.js, including components to visualize information in a meaningful way to airline management

It uses a suprisingly small amount of code to accomplish a lot, deployed on a platform that provides reliability and scalability

It was developed using VS Code, and is entirely open source

Schedule View:
<img src="https://github.com/vincent-tsugranes/redhat-airline-ui/raw/main/public/redhat-airline-schedule.png"></img>

Live Map:
<img src="https://github.com/vincent-tsugranes/redhat-airline-ui/raw/main/public/redhat-airline-livemap.png"></img>

Flight Drill-Down:
<img src="https://github.com/vincent-tsugranes/redhat-airline-ui/raw/main/public/redhat-airline-flight-drilldown.png"> </img>

Search for Flights, Airports, Crewmembers:
<img src="https://github.com/vincent-tsugranes/redhat-airline-ui/raw/main/public/redhat-airline-search.png"> </img>

## Running Locally:
```
 npm run start
```

## Deploying application and services to OpenShift


##### Step 1 - login to the OpenShift cluster

```
oc login -u <USERNAME> -p <PASSWORD> --server=https://CLUSTER_API_DNS:6443
```

##### Step 2 - create an OpenShift project
```
oc new-project redhat-airline
```

##### Step 3 - deploy the api services
```
oc new-app \
  -n redhat-airline \
  --name=redhat-airline-flight-api nodejs:latest~https://github.com/vincent-tsugranes/redhat-airline-flight-api.git \
  -e PORT=8080 \
  -l app=redhat-airline

oc new-app \
  -n redhat-airline \
  --name=redhat-airline-crewmember-api nodejs:latest~https://github.com/vincent-tsugranes/redhat-airline-crewmember-api.git \
  -e PORT=8080 \
  -l app=redhat-airline

oc new-app \
  -n redhat-airline \
  --name=redhat-airline-airport-api nodejs:latest~https://github.com/vincent-tsugranes/redhat-airline-airport-api.git \
  -e PORT=8080 \
  -l app=redhat-airline
```

##### Step 4 - expose those services so the client can call them
```
oc expose service/redhat-airline-flight-api
oc expose service/redhat-airline-crewmember-api
oc expose service/redhat-airline-airport-api
```

##### Step 5 - Deploy and expose the web page
```
oc new-app \
  -n redhat-airline \
  --name=redhat-airline-ui nodejs:latest~https://github.com/vincent-tsugranes/redhat-airline-ui.git \
  -e VUE_APP_FLIGHT_API_URL=https://$(oc get route redhat-airline-flight-api -o json | jq -r '.spec.host') \
  -e VUE_APP_CREWMEMBER_API_URL=https://$(oc get route redhat-airline-crewmember-api -o json | jq -r '.spec.host') \
  -e VUE_APP_AIRPORT_API_URL=https://$(oc get route redhat-airline-airport-api -o json | jq -r '.spec.host') \
  -l app=redhat-airline

oc expose service/redhat-airline-ui
```

##### Step 6 - label and annotate everything so it looks nice in the openshift topology view
```
oc label deployment -l app=redhat-airline app.kubernetes.io/name=nodejs

oc annotate deployment -l app=redhat-airline-ui app.openshift.io/connects-to='[{"apiVersion":"apps/v1","kind":"Deployment","name":"redhat-airline-airport-api"},{"apiVersion":"apps/v1","kind":"Deployment","name":"redhat-airline-crewmember-api"},{"apiVersion":"apps/v1","kind":"Deployment","name":"redhat-airline-flight-api"}]'
```
<img src="https://github.com/vincent-tsugranes/redhat-airline-ui/raw/main/public/redhat-airline-openshift-console.png"></img>


## Developer notes:
You can run these Node.js services locally without setting and environment variables. They default to ports 9001 and up, 