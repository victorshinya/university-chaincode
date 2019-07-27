/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Aux = require('./aux.js');
const fs = require('fs');

class UniversityContract extends Contract {

    async universityExists(ctx, cnpj) {
        const buffer = await ctx.stub.getState(cnpj);
        return (!!buffer && buffer.length > 0);
    }

    async createUniversity(ctx, cnpj, universityName) {
        const exists = await this.universityExists(ctx, cnpj);
        if (exists) {
            throw new Error(`The university ${cnpj} already exists`);
        }
        const asset = {
            cnpj: cnpj,
            name: universityName,
            library: []
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(cnpj, buffer);
    }

    async readUniversity(ctx, cnpj) {
        const exists = await this.universityExists(ctx, cnpj);
        if (!exists) {
            throw new Error(`The university ${cnpj} does not exist`);
        }
        const buffer = await ctx.stub.getState(cnpj);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateUniversity(ctx, cnpj, universityName) {
        const exists = await this.universityExists(ctx, cnpj);
        if (!exists) {
            throw new Error(`The university ${cnpj} does not exist`);
        }
        var university = await ctx.stub.getState(cnpj);
        university = JSON.parse(university);
        const asset = { 
            cnpj: cnpj,
            name: universityName,
            library: university.library
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(cnpj, buffer);
    }

    async deleteUniversity(ctx, cnpj) {
        const exists = await this.universityExists(ctx, cnpj);
        if (!exists) {
            throw new Error(`The university ${cnpj} does not exist`);
        }
        await ctx.stub.deleteState(cnpj);
    }

    async createBook(ctx, cnpj, bookName) {
        const exists = await this.universityExists(ctx, cnpj);
        if (!exists) {
            throw new Error(`The university ${cnpj} does not exist`);
        }
        var university = await ctx.stub.getState(cnpj);
        university = JSON.parse(university);
        const book = {
            book: bookName,
            date: new Date()
        };
        university.library.push(book);
        const buffer = Buffer.from(JSON.stringify(university));
        await ctx.stub.putState(cnpj, buffer);
    }

    async readUniversityHistory(ctx, cnpj) {
        const exists = await this.universityExists(ctx, cnpj);
        if (!exists) {
            throw new Error(`The university ${cnpj} does not exist`);
        }
        const history = await ctx.stub.getHistoryForKey(cnpj);
        const universityHistory = history !== undefined ? await Aux.iteratorForJSON(history, true) : [];
        const stringUniversityHistory = JSON.stringify(universityHistory);
        fs.writeFile('history.json', stringUniversityHistory, err => {
            if (err) console.error(err);
            console.log('History CREATED!');
        });
        return {
            status: 'Ok',
            history: stringUniversityHistory
        }
    }

}

module.exports = UniversityContract;
