FROM --platform=linux/amd64 rust:latest
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY . .
# We remove the lockfile to ensure we pick up the new Cargo.toml changes
RUN rm -f Cargo.lock && cargo clean && cargo build --release
CMD ["ls", "-l", "target/release/oracle-function"]