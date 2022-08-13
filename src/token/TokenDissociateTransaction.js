/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import Hbar from "../Hbar.js";
import TokenId from "./TokenId.js";
import AccountId from "../account/AccountId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import * as symbols from "../Symbols.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ITokenDissociateTransactionBody} HashgraphProto.proto.ITokenDissociateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenID} HashgraphProto.proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Dissociate a new Hedera™ crypto-currency token.
 */
export default class TokenDissociateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {(TokenId | string)[]} [props.tokenIds]
     * @param {AccountId | string} [props.accountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TokenId[]}
         */
        this._tokenIds = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;

        this._defaultMaxTransactionFee = new Hbar(5);

        if (props.tokenIds != null) {
            this.setTokenIds(props.tokenIds);
        }

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {TokenDissociateTransaction}
     */
    static [symbols.fromProtobuf](
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const dissociateToken =
            /** @type {HashgraphProto.proto.ITokenDissociateTransactionBody} */ (
                body.tokenDissociate
            );

        return Transaction[symbols.fromProtobufTransactions](
            new TokenDissociateTransaction({
                tokenIds:
                    dissociateToken.tokens != null
                        ? dissociateToken.tokens.map((token) =>
                              TokenId[symbols.fromProtobuf](token)
                          )
                        : undefined,
                accountId:
                    dissociateToken.account != null
                        ? AccountId[symbols.fromProtobuf](
                              dissociateToken.account
                          )
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?TokenId[]}
     */
    get tokenIds() {
        return this._tokenIds;
    }

    /**
     * @param {(TokenId | string)[]} tokenIds
     * @returns {this}
     */
    setTokenIds(tokenIds) {
        this[symbols.requireNotFrozen]();
        this._tokenIds = tokenIds.map((tokenId) =>
            typeof tokenId === "string"
                ? TokenId.fromString(tokenId)
                : tokenId.clone()
        );

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId) {
        this[symbols.requireNotFrozen]();
        this._accountId =
            typeof accountId === "string"
                ? AccountId.fromString(accountId)
                : accountId.clone();

        return this;
    }

    /**
     * @param {Client} client
     */
    [symbols.validateChecksums](client) {
        if (this._accountId != null) {
            this._accountId.validateChecksum(client);
        }

        for (const tokenId of this._tokenIds != null ? this._tokenIds : []) {
            if (tokenId != null) {
                tokenId.validateChecksum(client);
            }
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    [symbols.execute](channel, request) {
        return channel.token.dissociateTokens(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    [symbols.getTransactionDataCase]() {
        return "tokenDissociate";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.ITokenDissociateTransactionBody}
     */
    [symbols.makeTransactionData]() {
        return {
            tokens:
                this._tokenIds != null
                    ? this._tokenIds.map((tokenId) =>
                          tokenId[symbols.toProtobuf]()
                      )
                    : null,
            account:
                this._accountId != null
                    ? this._accountId[symbols.toProtobuf]()
                    : null,
        };
    }

    /**
     * @returns {string}
     */
    [symbols.getLogId]() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `TokenDissociateTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "tokenDissociate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenDissociateTransaction[symbols.fromProtobuf]
);
