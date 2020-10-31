const net = require("net");
const Docker = require("dockerode");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

(async () => {
  const network = await docker.createNetwork({ Name: "port-forward-net" });
  const target = docker.getContainer(process.argv[2]);
  console.log("Connecting to", process.argv[2]);
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
        Cmd: [
          "socat",
          "STDIO",
          `TCP-CONNECT:${process.argv[2]}:${process.argv[3]}`,
        ],
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
      console.error("Something bad happened", e);
    }
  });

  const port = Number(process.argv[4] || 4000);

  s.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down...");
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
})();
