"use strict";
const React = require("react");
const PropTypes = require("prop-types");
const { Text, Color, Box } = require("ink");
const { useWavelet, useAccount } = require("react-use-wavelet");
const { Wavelet } = require("wavelet-client");
const { BigInt } = require("jsbi");
const fs = require("fs");

const App = ({
  pk,
  deploy,
  gasLimit,
  gasDeposit,
  host = "https://testnet.perlin.net",
  gen
}) => {

  if (pk) {
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

// const Call = ({ client, contract,  })

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
