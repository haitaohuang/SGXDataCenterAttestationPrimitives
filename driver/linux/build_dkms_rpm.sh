#!/bin/bash

if test $(id -u) -ne 0; then
    echo "Root privilege is required."
    exit 1
fi
source dkms.conf
dkms add .
dkms build sgx/$PACKAGE_VERSION
dkms mkrpm sgx/$PACKAGE_VERSION --source-only
cp  /var/lib/dkms/sgx/$PACKAGE_VERSION/rpm/sgx-${PACKAGE_VERSION}-1dkms.x86_64.rpm .

