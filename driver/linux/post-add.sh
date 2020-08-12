#!/bin/bash
cp 10-sgx.rules /etc/udev/rules.d
sudo groupadd sgx_prv || true
