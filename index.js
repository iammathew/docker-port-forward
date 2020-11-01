#!/usr/bin/env node
const net = require("net");
const Docker = require("dockerode");
const color = require("colorette");

const containerId = process.argv[2];
if (containerId == null) {
  console.error(color.red("🔴 You must specify a container id or name"));
  process.exit(1);
}
const containerPort = process.argv[3];
if (containerPort == null) {
  console.error(color.red("🔴 You must specify a container port"));
  process.exit(1);
}
const hostPort = Number(process.argv[4] || 4000);

const docker = new Docker();

(async () => {
  try {
    const network = await docker.createNetwork({ Name: "port-forward-net" });
    const target = docker.getContainer(containerId);
    console.log(color.yellow(`🔌 Connecting to ${target.id}...`));
    await network.connect({
      Container: target.id,
    });
    const container = await docker.createContainer({
      Image: "docker-port-forward",
    });
    await container.start();
    await network.connect({
      Container: container.id,
    });
    const s = net.createServer(async (socket) => {
      try {
        const exec = await container.exec({
          Cmd: ["socat", "STDIO", `TCP-CONNECT:${target.id}:${containerPort}}`],
          AttachStdin: true,
          AttachStdout: true,
          AttachStderr: true,
        });
        const stream = await exec.start({
          hijack: true,
          stdin: true,
        });
        docker.modem.demuxStream(stream, socket, process.stderr);
        socket.pipe(stream);
      } catch (e) {
        console.error(color.red(`🔴 Error during forwarding: ${e.message}`));
      }
    });

    s.listen(hostPort, () => {
      console.log(
        color.green(
          `🚀 Forwarding ${target.id}:${containerPort} to localhost:${hostPort}`
        )
      );
    });

    process.on("SIGINT", async () => {
      console.log(color.yellow("Shutting down..."));
      s.close();
      await network.disconnect({
        Container: target.id,
      });
      await network.disconnect({
        Container: container.id,
      });
      await network.remove();
      await container.stop();
      await container.remove();
      process.exit(0); // if you don't close yourself this will run forever
    });
  } catch (e) {
    console.error(color.red(`🔴 Error: ${e.message}`));
    process.exit(1);
  }
})();
