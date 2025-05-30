import assert from "assert";
import { Account } from "./bank_account";

interface BankInterface {
  addAccountType: (accountType: accountType) => void;
  openAccount: (accountType: accountType) => string;
  getBalance: (accNumber: string) => string;
  deposit: (accNumber: string, amount: number) => void;
  withdraw: (accNumber: string, amount: number) => void;
  transfer: (transferDetails: {
    fromAccNumber: string;
    toAccNumber: string;
    amount: number;
  }) => void;
  getInterestRate: (accNumber: string) => number;
  applyInterest: (accNumber: string) => void;
}

interface accountType {
  type: string;
  interestRate: number;
}

const getAccountTypeInterestRate = (
  type: string,
  accountTypes: accountType[]
): number => {
  const accountTypeObj = accountTypes.find((account) => account.type === type);
  assert(accountTypeObj, `Account type ${type} not found`);
  return accountTypeObj.interestRate;
};

const isAccNumberTaken = (accNumber: string, accounts: Account[]): boolean =>
  accounts.some((account) => account.accountNumber === accNumber);

const generateAccountNumber = (accounts: Account[]): string => {
  let accNumber: string;
  do {
    accNumber = Math.random().toString(36).substring(2, 10).toUpperCase();
  } while (isAccNumberTaken(accNumber, accounts));
  return accNumber;
};

const retrieveAccount = (accNumber: string, accounts: Account[]): Account => {
  const account = accounts.find(
    (account) => account.accountNumber === accNumber
  );
  assert(account, `Account with number ${accNumber} not found`);
  return account;
};

export class Bank implements BankInterface {
  #accounts: Account[];
  #accountTypes: accountType[];

  get accounts(): Account[] {
    return this.#accounts;
  }

  get accountTypes(): accountType[] {
    return this.#accountTypes;
  }

  addAccountType({ type, interestRate }: accountType) {
    assert(interestRate >= 0, "Interest rate must be non-negative");
    assert(
      !this.#accountTypes.some((account) => account.type === type),
      `Account type ${type} already exists`
    );
    this.#accountTypes.push({ type, interestRate });
  }

  openAccount(type: accountType): string {
    const interestRate = getAccountTypeInterestRate(
      type.type,
      this.#accountTypes
    );
    const accountNumber = generateAccountNumber(this.#accounts);
    const newAccount = new Account({ interestRate });
    newAccount.accountNumber = accountNumber;
    this.#accounts.push(newAccount);
    return accountNumber;
  }

  getBalance(accNumber: string): string {
    const account = retrieveAccount(accNumber, this.#accounts);
    return account.getBalance().toString();
  }

  deposit(accNumber: string, amount: number): void {
    const account = retrieveAccount(accNumber, this.#accounts);
    account.deposit(amount);
  }

  withdraw(accNumber: string, amount: number): void {
    const account = retrieveAccount(accNumber, this.#accounts);
    account.withdraw(amount);
  }

  transfer({
    fromAccNumber,
    toAccNumber,
    amount,
  }: {
    fromAccNumber: string;
    toAccNumber: string;
    amount: number;
  }): void {
    assert(
      fromAccNumber !== toAccNumber,
      "Cannot transfer to the same account"
    );
    assert(amount > 0, "Transfer amount must be positive");
    assert(
      this.#accounts.some((account) => account.accountNumber === fromAccNumber),
      `From account ${fromAccNumber} not found`
    );
    assert(
      this.#accounts.some((account) => account.accountNumber === toAccNumber),
      `To account ${toAccNumber} not found`
    );
    assert(
      retrieveAccount(fromAccNumber, this.#accounts).getBalance().gte(amount),
      "Insufficient funds for transfer"
    );
    const fromAccount = retrieveAccount(fromAccNumber, this.#accounts);
    const toAccount = retrieveAccount(toAccNumber, this.#accounts);
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);
  }

  getInterestRate(accNumber: string): number {
    const account = retrieveAccount(accNumber, this.#accounts);
    return account.interestRate.toNumber();
  }

  applyInterest(accNumber: string): void {
    const account = retrieveAccount(accNumber, this.#accounts);
    account.applyInterest();
  }
}
