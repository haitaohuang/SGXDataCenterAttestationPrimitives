#!/bin/bash
rm /etc/udev/rules.d/10-sgx.rules
groupdel sgx_prv || true
