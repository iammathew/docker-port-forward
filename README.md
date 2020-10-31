# Docker Port Forward

## What does this tool do?

This tool allows you to setup a port forwarding for any port inside a docker container, even when it has not been exposed.
`docker-port-forward 80 test-container 6060` will expose port0 `80` of the container on port `6060` wher you run the tool.

## Installing the tool

NPM:  
`npm install -g docker-port-forward`  
Yarn:  
`yarn global add docker-port-forward`

## How do I run the tool

`docker-port-forward <containerport> <containerid/name> <hostport(default:4000,optional)>`

## How does the tool do this?

It connects first the container to a newly created network and starts a sidecar, this sidecar now has access to all the ports on the container.
Once you connect to the portforwarded port it will use `STDIO` using the docker engine api to forward the traffic over the sidecar (which starts an `socat` process) to the target container.

## Why do we need this?

Normally its not possible to gain access to a port on a running docker container without restarting it (but sometimes you dont want to), so this tool circumvents this. Alternative usecase is getting access to a containers port when you only have access to the docker engine api.
