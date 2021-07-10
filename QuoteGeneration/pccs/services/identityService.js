/*
 * Copyright (C) 2011-2020 Intel Corporation. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in
 *     the documentation and/or other materials provided with the
 *     distribution.
 *   * Neither the name of Intel Corporation nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
import PccsError from '../utils/PccsError.js';
import PccsStatus from '../constants/pccs_status_code.js';
import Config from 'config';
import Constants from '../constants/index.js';
import * as qeidentityDao from '../dao/qeidentityDao.js';
import * as qveidentityDao from '../dao/qveidentityDao.js';
import * as pcsCertificatesDao from '../dao/pcsCertificatesDao.js';
import * as pcsClient from '../pcs_client/pcs_client.js';
import { sequelize } from '../dao/models/index.js';

export async function getQeIdentityFromPCS() {
  const pck_server_res = await pcsClient.getQeIdentity();

  if (pck_server_res.statusCode != Constants.HTTP_SUCCESS) {
    throw new PccsError(PccsStatus.PCCS_STATUS_NO_CACHE_DATA);
  }

  let result = {};
  result[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN] =
    pck_server_res.headers[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN];
  result['qeid'] = JSON.parse(pck_server_res.body);

  await sequelize.transaction(async (t) => {
    // update or insert QE Identity
    await qeidentityDao.upsertQeIdentity(pck_server_res.body);
    // update or insert certificate chain
    await pcsCertificatesDao.upsertEnclaveIdentityIssuerChain(
      pck_server_res.headers[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN]
    );
  });

  return result;
}

export async function getQeIdentity() {
  // query qeid from local database first
  const qeid = await qeidentityDao.getQeIdentity();
  let result = {};
  if (qeid == null) {
    if (
      Config.get(Constants.CONFIG_OPTION_CACHE_FILL_MODE) ==
      Constants.CACHE_FILL_MODE_LAZY
    ) {
      result = await this.getQeIdentityFromPCS();
    } else {
      throw new PccsError(PccsStatus.PCCS_STATUS_NO_CACHE_DATA);
    }
  } else {
    result[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN] =
      qeid.signing_cert + qeid.root_cert;
    result['qeid'] = JSON.parse(qeid.qe_identity);
  }

  return result;
}

export async function getQveIdentityFromPCS() {
  const pck_server_res = await pcsClient.getQveIdentity();

  if (pck_server_res.statusCode != Constants.HTTP_SUCCESS) {
    throw new PccsError(PccsStatus.PCCS_STATUS_NO_CACHE_DATA);
  }

  let result = {};
  result[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN] =
    pck_server_res.headers[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN];
  result['qveid'] = JSON.parse(pck_server_res.body);

  await sequelize.transaction(async (t) => {
    // update or insert QvE Identity
    await qveidentityDao.upsertQveIdentity(pck_server_res.body);
    // update or insert certificate chain
    await pcsCertificatesDao.upsertEnclaveIdentityIssuerChain(
      pck_server_res.headers[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN]
    );
  });

  return result;
}

export async function getQveIdentity() {
  // query qveid from local database first
  const qveid = await qveidentityDao.getQveIdentity();
  let result = {};
  if (qveid == null) {
    if (
      Config.get(Constants.CONFIG_OPTION_CACHE_FILL_MODE) ==
      Constants.CACHE_FILL_MODE_LAZY
    ) {
      result = await this.getQveIdentityFromPCS();
    } else {
      throw new PccsError(PccsStatus.PCCS_STATUS_NO_CACHE_DATA);
    }
  } else {
    result[Constants.SGX_ENCLAVE_IDENTITY_ISSUER_CHAIN] =
      qveid.signing_cert + qveid.root_cert;
    result['qveid'] = JSON.parse(qveid.qve_identity);
  }

  return result;
}
