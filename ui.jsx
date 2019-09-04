"use strict";
const React = require("react");
const PropTypes = require("prop-types");
const { Text, Color, Box } = require("ink");
const { useWavelet, useAccount, useContract } = require("react-use-wavelet");
const { Wavelet } = require("wavelet-client");
const { BigInt } = require("jsbi");
const fs = require("fs");

const App = ({
  pk,
  deploy,
  call,
  test,
  contractAddress,
  params,
  gasLimit,
  gasDeposit,
  host = "https://testnet.perlin.net",
  gen
}) => {
  if (pk) {
    if (test) {
      const wallet = Wavelet.loadWalletFromPrivateKey(pk);
      return (
        <WithClient host={host}>
          {({ client }) => (
            <WithContract client={client} address={contractAddress}>
              {({ contract }) => (
                <Test
                  wallet={wallet}
                  client={client}
                  contract={contract}
                  fn={test}
                  gasLimit={gasLimit}
                  params={params}
                />
              )}
            </WithContract>
          )}
        </WithClient>
      );
    }
    if (call) {
      const wallet = Wavelet.loadWalletFromPrivateKey(pk);
      return (
        <WithClient host={host}>
          {({ client }) => (
            <WithContract client={client} address={contractAddress}>
              {({ contract }) => (
                <Call
                  wallet={wallet}
                  client={client}
                  contract={contract}
                  fn={call}
                  gasLimit={gasLimit}
                  gasDeposit={gasDeposit}
                  params={params}
                />
              )}
            </WithContract>
          )}
        </WithClient>
      );
    }
    if (deploy) {
      const wallet = Wavelet.loadWalletFromPrivateKey(pk);
      return (
        <WithClient host={host}>
          {({ client }) => (
            <Deploy
              wallet={wallet}
              client={client}
              path={deploy}
              gasLimit={gasLimit}
              gasDeposit={gasDeposit}
            />
          )}
        </WithClient>
      );
    }
    return (
      <WithClient host={host}>
        {({ client }) => (
          <WithAccount privateKey={pk} client={client}>
            {AccountDetails}
          </WithAccount>
        )}
      </WithClient>
    );
  }
  return <Text>No command specified</Text>;
};

const AccountDetails = ({ account }) => {
  return (
    <Box flexDirection="column">
      <Text underline>Account Details</Text>
      <Text>Balance: {account.balance} PERLs</Text>
      <Text>Public Key: {account.public_key}</Text>
    </Box>
  );
};

const Call = ({
  client,
  contract,
  fn,
  params,
  wallet,
  gasLimit,
  gasDeposit
}) => {
  const [res, setRes] = React.useState();
  React.useEffect(() => {
    contract
      .call(
        wallet,
        fn,
        BigInt(gasLimit),
        BigInt(gasLimit),
        BigInt(gasDeposit),
        params && JSON.parse(params)
      )
      .then(setRes);
  }, [client, wallet]);

  if (!res) {
    return <Text>Calling...</Text>;
  }
  return <Text>Called with tx {res.tx_id}</Text>;
};

const Test = ({ client, contract, fn, params, wallet, gasLimit }) => {
  console.log("params", params);
  const [res, setRes] = React.useState();
  React.useEffect(() => {
    if(contract){
      setRes(
        contract.test(
          wallet,
          fn,
          BigInt(0),
          BigInt(gasLimit),
          //params && JSON.parse(params)
        )
      );
    }
  }, [contract, wallet]);

  if (!res) {
    return <Text>Testing...</Text>;
  }
  // res.logs.map((x) => console.log(x))
  // console.log(res.logs)
  return (
    <Text>
      {JSON.stringify(res.logs)}
      {/* Logs:{" "} */}
      {/* {res.logs.map((x, i) => ( */}
      {/*   <Box> */}
      {/*   <Text> */}
      {/*     {i}\n{x} */}
      {/*   </Text> */}
      {/*   </Box> */}
      {/* ))} */}
    </Text>
  );
};

const Deploy = ({ client, wallet, path, gasLimit, gasDeposit = 0 }) => {
  const file = fs.readFileSync(path);
  const [res, setRes] = React.useState();
  React.useEffect(() => {
    client
      .deployContract(wallet, file, BigInt(gasLimit), BigInt(gasDeposit))
      .then(setRes);
  }, [client, wallet, path]);
  if (!res) {
    return <Text>Deploying...</Text>;
  }
  return <Text>Requesting deployment with tx {res.tx_id}</Text>;
};

const WithClient = ({ host, children }) => {
  const [client, node, clientErr] = useWavelet(host);

  if (clientErr) {
    return <Text>Error connecting to Wavelet: {clientErr.toString()}</Text>;
  }
  if (!client) {
    return <Text>Loading....</Text>;
  }
  return children({ client, clientErr });
};

const WithContract = ({ client, address, children }) => {
  const [contract, contractErr] = useContract(client, address);

  if (contractErr) {
    return <Text>Error loading contract: {contractErr.toString()}</Text>;
  }
  if (!contract) {
    return <Text>Loading....</Text>;
  }
  return children({ contract });
};

const WithAccount = ({ client, privateKey, children }) => {
  const [account, accountErr] = useAccount(client, privateKey);

  if (accountErr) {
    return <Text>Error loading account: {accountErr.toString()}</Text>;
  }
  if (!account) {
    return <Text>Loading....</Text>;
  }
  return children({ account, accountErr });
};

// App.propTypes = {
//   name: PropTypes.string
// };

module.exports = App;
