// modulos externos
import inquirer from "inquirer";
import chalk from "chalk";

// modulos internos
import * as fs from "node:fs";
operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que voce deseja fazer ?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Transferir",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((res) => {
      const action = res.action;
      if (action === "Criar conta") {
        createAccount();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Consultar saldo") {
        getAccountBalance();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Transferir") {
        transfer();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts ! "));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

// create an account
const createAccount = () => {
  console.log(chalk.bgGreen.black("Parabéns por escolher nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));
  buildAccount();
};

const buildAccount = () => {
  inquirer
    .prompt({
      name: "accountName",
      message: "Digite um nome para sua conta: ",
    })
    .then((res) => {
      const accountName = res.accountName;
      console.info(accountName);
      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta ja existe, escolha outro nome")
        );
        buildAccount();
        return;
      }
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        (err) => {
          console.log(err);
        }
      );
      console.log(chalk.green("Parabéns sua conta foi criada ! "));
      operation();
    })
    .catch((err) => console.log(err));
};

// add an amount ot user account

const deposit = () => {
  inquirer
    .prompt({
      name: "accountName",
      message: "Qual o nome da sua conta ?",
    })
    .then((res) => {
      const accountName = res.accountName;
      // verify if account exists

      if (!checkAccount(accountName)) {
        return deposit();
      }
      inquirer
        .prompt({
          name: "amount",
          message: "Quanto você deseja depositar ?",
        })
        .then((res) => {
          const amount = res.amount;
          // add an amount
          addAmount(accountName, amount);

          operation();
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

const checkAccount = (accountName) => {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black("Esta conta não existe, tente novamente"));
    return false;
  }
  return true;
};

// add amount

const addAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde")
    );
    return deposit();
  }
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );
  console.log(
    chalk.green(`Foi depositado o valor de R$:${amount}, na sua conta !`)
  );
};

const getAccount = (accountName) => {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
};

// Show account ballance

function getAccountBalance() {
  inquirer
    .prompt({
      name: "accountName",
      message: "Qual o nome da sua conta ?",
    })
    .then((res) => {
      const accountName = res.accountName;

      // verify if account exist

      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);
      console.log(
        chalk.bgBlue.black(
          `Olá, ${accountName}, o saldo da sua conta é R$: ${accountData.balance} `
        )
      );
      operation();
    })
    .catch((err) => {});
}

// withdraw an amount from user account
function withdraw() {
  inquirer
    .prompt({
      name: "accountName",
      message: "Qual o nome da sua conta?",
    })
    .then((res) => {
      const accountName = res.accountName;

      if (!checkAccount(accountName)) {
        return withdraw();
      }
      inquirer
        .prompt({
          name: "amount",
          message: "Quantos reais você deseja sacar ?",
        })
        .then((res) => {
          const amount = res.amount;
          removeAmount(accountName, amount);
        })
        .catch((err) => {});
    })
    .catch((err) => {});
}

const removeAmount = (accountName, amount) => {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde !")
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponivel !"));
    return withdraw();
  }
  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );
  console.log(
    chalk.green(`Você realizou um saque de R$ ${amount} da sua conta`)
  );
  operation();
};

const transfer = () => {
  inquirer
    .prompt({
      name: "accountName1",
      message: "Qual o nome da sua conta?",
    })
    .then((res) => {
      const accountName1 = res.accountName1;
      if (!checkAccount(accountName1)) {
        return transfer();
      }
      inquirer
        .prompt({
          name: "amount",
          message: "Qual valor você deseja enviar?",
        })
        .then((res) => {
          const amount = res.amount;
          const accountData1 = getAccount(accountName1);
          if (!amount) {
            console.log(
              chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde !")
            );
            return transfer();
          }
          if (accountData1.balance < amount) {
            console.log(chalk.bgRed.black("Valor indisponivel !"));
            return transfer();
          }
          checkSecondAccount();
          function checkSecondAccount() {
            inquirer
              .prompt({
                name: "accountName2",
                message: "Qual o nome da conta que você deseja transferir ?",
              })
              .then((res) => {
                const accountName2 = res.accountName2;
                if (!checkAccount(accountName2)) {
                  return checkSecondAccount();
                }
                const accountData2 = getAccount(accountName2);

                accountData1.balance =
                  parseFloat(accountData1.balance) - parseFloat(amount);
                fs.writeFileSync(
                  `accounts/${accountName1}.json`,
                  JSON.stringify(accountData1),
                  function (err) {
                    console.log(err);
                  }
                );
                accountData2.balance =
                  parseFloat(accountData2.balance) + parseFloat(amount);
                fs.writeFileSync(
                  `accounts/${accountName2}.json`,
                  JSON.stringify(accountData2),
                  function (err) {
                    console.log(err);
                  }
                );
                operation();
              })
              .catch((err) => {});
          }
        })
        .catch((err) => {});
    })
    .catch((err) => {
      console.log(err);
    });
};
