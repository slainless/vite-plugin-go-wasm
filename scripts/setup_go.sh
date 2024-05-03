#!/usr/bin/env bash

VERSION="1.22.2"

case $(arch) in
  "x86_64")             arch="amd64" ;;
  "i686" | "i386")      arch="386"   ;;
  "arm64" | "aarch64")  arch="arm64" ;;
  *)
    echo "Unsupported test platform architecture: $(arch)"
    exit 1
    ;;
esac

case "$OSTYPE" in
  "linux-gnu"*)       
    os="linux"
    format="tar.gz" 
    ;;
  "darwin"*)          
    os="darwin"
    format="tar.gz"
    if [[ $(arch) == "i686" || "i386" ]]; then
      echo "Unsupported test platform architecture for darwin: i386"
      exit 1
    fi
    arch="amd64"
    ;;
  "cygwin" | "msys" ) 
    os="windows"
    format="zip"
    ;;
  *)
    echo "Unsupported test platform operating system: $OSTYPE"
    exit 2
    ;;
esac

link="https://go.dev/dl/go${VERSION}.${os}-${arch}.${format}"
dest="test/go${VERSION}.${os}-${arch}.${format}"

if [ ! -f "$dest" ]; then
  echo "🔹 Downloading Go binary from ${link}, saving to ${dest}"
  curl "$link" -L -o "$dest"
fi

echo "🔹 Extracting ${dest} to test/go"
if [[ "$format" == "zip" ]]; then
  unzip -o -q "$dest" -x "go/src/*" "go/test/*" "go/src/**/*" "go/test/**/*" "go/pkg/**/*" -d "test"
else
  tar -xz "$dest" -C "test" --exclude "go/src" --exclude "go/test" --exclude "go/pkg"
fi