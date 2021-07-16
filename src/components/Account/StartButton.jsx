import React from "react";
import Background from "../../images/assets/startButton.svg";
import * as style from "./StartButton.module.css";
import { Loading, Spacer, User, useToasts } from "@geist-ui/react";

import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { navigate } from "gatsby-link";
import Loader from "../../cardano/loader";

// Asset
import Avatar from "../../images/assets/avatar.png";
import buffer from "buffer";
import { useStoreActions, useStoreState } from "easy-peasy";
const Buffer = buffer.Buffer;

const addressToBech32 = async () => {
  await Loader.load();
  const address = (await window.cardano.getUsedAddresses())[0];
  return Loader.Cardano.Address.from_bytes(
    Buffer.from(address, "hex")
  ).to_bech32();
};
const StartButton = (props) => {
  const matches = useBreakpoint();
  const [loading, setLoading] = React.useState(false);
  const [account, setAccount] = React.useState(null);
  const connected = useStoreState((state) => state.connection.connected);
  const setConnected = useStoreActions(
    (actions) => actions.connection.setConnected
  );
  const [, setToast] = useToasts();

  React.useEffect(() => {
    if (connected)
      window.cardano.onAccountChange(() => window.location.reload());
  }, [connected]);

  return account ? (
    <div
      className={style.accountButton}
      style={{
        width: 100,
        height: 45,
        zoom: matches.md && "0.85",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/profile/${account}`)}
    >
      <img src={Avatar} width={24} />
      <Spacer x={0.2} />
      <div style={{ fontWeight: "bold" }}>Account</div>
    </div>
  ) : (
    <div
      className={style.startButton}
      style={{
        width: 100,
        height: 45,
        borderRadius: 25,
        fontWeight: 500,
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "7px -8px",
        backgroundColor: "#4D438C",
        backgroundRepeat: "no-repeat",
        border: "none",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "45px",

        zoom: matches.md && "0.85",
      }}
      onClick={async () => {
        setLoading(true);
        if (!window.cardano) {
          setToast({
            delay: 5000,
            text: (
              <span style={{ fontWeight: "bolder" }}>
                Get Nami Wallet first
              </span>
            ),
            actions: [
              {
                name: "Get",
                handler: () => window.open("https://namiwallet.io"),
              },
            ],
          });
          setLoading(false);
          return;
        }
        if ((await window.cardano.getNetworkId()) !== 1) {
          setToast({
            delay: 5000,
            text: (
              <span style={{ fontWeight: "bolder" }}>
                Wrong network, please switch to mainnet
              </span>
            ),
          });
          setLoading(false);
          return;
        }
        await window.cardano.enable().then(async () => {
          const address = await addressToBech32();
          setAccount(address);
          setConnected();
        });
        setLoading(false);
      }}
    >
      {loading ? <Loading color="white" /> : "Connect"}
    </div>
  );
};

export default StartButton;