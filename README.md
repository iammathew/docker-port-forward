# Docker Port Forward

Simple port forwarding of ports not exposed by a container

![Build sidecar docker image](https://github.com/khayalan-mathew/docker-port-forward/workflows/Build%20sidecar%20docker%20image/badge.svg)
![Build example docker image](https://github.com/khayalan-mathew/docker-port-forward/workflows/Build%20example%20docker%20image/badge.svg)

## Installing the tool

NPM:  
`npm install -g docker-port-forward`  
Yarn:  
`yarn global add docker-port-forward`

## How do I run the tool

Its as easy as running this inside your terminal:  
`docker-port-forward <containerid/name> <containerport> <hostport(default:4000,optional)>`

## What does this tool do?

This tool allows you to setup a port forwarding for any port inside a docker container, even when it has not been exposed.
`docker-port-forward test-container 80 6060` will expose port `80` of the container on port `6060` where you run the tool.

## How does the tool do this?

It connects first the container to a newly created network and starts a sidecar, this sidecar now has access to all the ports on the container.
Once you connect to the portforwarded port it will use `STDIO` using the docker engine api to forward the traffic over the sidecar (which starts an `socat` process) to the target container.

## Why do we need this?

Normally its not possible to gain access to a port on a running docker container without restarting it (but sometimes you dont want to), so this tool circumvents this. Alternative usecase is getting access to a containers port when you only have access to the docker engine api (this means also when the docker engine is running on another machine and you cant access any other port than the docker engine).

## Test the tool

First start a container which listens on a port but does not expose (in this case were using an nginx server, image can be found in the `example` folder):  
`docker run --name pf-test ghcr.io/iammathew/docker-port-forward/example:latest`

Now start the tool:  
`docker-port-forward pf-test 80 4000`

You should see the following inside your terminal:

```
🔌 Connecting to pf-test...
🚀 Forwarding pf-test:80 to localhost:4000
```

When you visit now `localhost:4000` with your webbrowser you should see a nginx start page :)
