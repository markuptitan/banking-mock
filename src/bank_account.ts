import assert from "assert";
import {Decimal} from "decimal.js";

interface BankAccount {
    deposit: (amount: Decimal) => void;
    withdraw: (amount: Decimal) => void;
    applyInterest: () => void;
    getBalance: () => Decimal;
    destroy: () => void;
}

export class Account implements BankAccount {
    private balance: Decimal;
    private interestRate: Decimal;

    constructor({interestRate = 0}: {interestRate?: number} = {}) {
        assert(interestRate >= 0, "Interest rate must be non-negative");
        this.balance = new Decimal(0);
        this.interestRate = new Decimal(interestRate);
    }

    deposit (amount: Decimal) {
        assert(new Decimal(amount).gt(0), "Deposit amount must be positive");
        this.balance = this.balance.plus(new Decimal(amount));
    }

    withdraw (amount: Decimal) {
        assert(new Decimal(amount).gt(0), "Withdrawal amount must be positive");
        assert(this.balance.gte(amount), "Insufficient funds for withdrawal");
        this.balance = this.balance.minus(new Decimal(amount));
    }

    getBalance () {
        return this.balance;
    }

    destroy () {
        this.balance = new Decimal(0);
        this.interestRate = new Decimal(0);
    }

    applyInterest () {
        const interest = this.balance.mul(this.interestRate);
        this.balance = this.balance.plus(interest);
    }   
}