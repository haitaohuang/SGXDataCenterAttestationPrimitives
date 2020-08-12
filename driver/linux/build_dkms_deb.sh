#!/bin/bash

if test $(id -u) -ne 0; then
    echo "Root privilege is required."
    exit 1
fi
source dkms.conf
dkms add .
dkms build sgx/$PACKAGE_VERSION
dkms mkdeb sgx/$PACKAGE_VERSION
cp  /var/lib/dkms/sgx/$PACKAGE_VERSION/deb/sgx-dkms_${PACKAGE_VERSION}_amd64.deb .

