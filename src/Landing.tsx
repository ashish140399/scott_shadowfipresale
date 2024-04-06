import React, { useEffect, useState } from "react";
import logo from "./assets/logo.png";
import { Button, Grid, Tooltip } from "@mui/material";
import styled from "styled-components";
import { styled as muistyled } from "@mui/material/styles";
import { LineChart, Line } from "recharts";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Countdown from "react-countdown";
import { Select } from "antd";
import "antd/dist/antd.css";
import useWalletConnection from "./hooks/useWalletConnection";
import { Contract } from "@ethersproject/contracts";
import {
  BSC_SCAN_LINK,
  CHAIN_ID,
  NETWORK_NAME,
  PRESALE_CONTRACT_ABI,
  PRESALE_CONTRACT_ADDRESS,
  PROVIDER_URL,
  SHADOWFI_CONTRACT_ABI,
  SHADOWFI_CONTRACT_ADDRESS,
  SHADOWFI_DECIMALS,
  TAG_PROVIDER,
  WALLETS,
} from "./libs/constants";
import { toast } from "react-toastify";
import {
  checkNumber,
  convertBNB2SDF,
  convertSDF2BNB,
  truncateAddress,
} from "./libs/utils";
import Web3 from "web3";
import useCatchTxError from "./hooks/useCatchTxError";
import { ethers } from "ethers";

interface Props {}
const { Option } = Select;

const BorderLinearProgress = muistyled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 30,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#39bdeb" : "#0d263f",
  },
}));

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 4000,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 3490,
    amt: 2100,
  },
];

const Landing: React.FC<Props> = (props) => {
  const [isShownWalletModal, setIsShownWalletModal] = useState<boolean>(false);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [cooldownLabel, setCooldownLabel] = useState<string>("");
  const [cooldownSubLabel, setCooldownSubLabel] = useState<string>("");
  const [assetTop, setAssetTop] = useState<string>("");
  const [assetBottom, setAssetBottom] = useState<string>("");
  const [typeTop, setTypeTop] = useState<string>("BNB");
  const [typeBottom, setTypeBottom] = useState<string>("SDF");
  const [totalSold, setTotalSold] = useState<number>(0);
  const [availableSale, setAvailableSale] = useState<number>(0);
  const [tokenCostBNB, setTokenCostBNB] = useState<number>(0);
  const [totalFunded, setTotalFunded] = useState<number>(0);
  const [isAirdropped, setIsAirdropped] = useState<boolean>(false);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);

  const { active, account, chainId, library, connectWallet, disconnectWallet } =
    useWalletConnection();
  const { fetchWithCatchTxError, loading } = useCatchTxError();

  const handleChange = (value: string, position: string) => {
    if (position === "top") {
      if (value === "BNB") {
        setAssetBottom(convertBNB2SDF(assetTop, tokenCostBNB));
        setTypeTop("BNB");
        setTypeBottom("SDF");
      } else {
        setAssetBottom(convertSDF2BNB(assetTop, tokenCostBNB));
        setTypeTop("SDF");
        setTypeBottom("BNB");
      }
    } else {
      if (value === "BNB") {
        setAssetTop(convertBNB2SDF(assetBottom, tokenCostBNB));
        setTypeTop("SDF");
        setTypeBottom("BNB");
      } else {
        setAssetTop(convertSDF2BNB(assetBottom, tokenCostBNB));
        setTypeTop("BNB");
        setTypeBottom("SDF");
      }
    }
  };

  const connect = (e: any, wallet: any) => {
    if (e) {
      e.preventDefault();
    }

    connectWallet(wallet, null);
  };

  const disconnect = (e: any = null) => {
    if (e) {
      e.preventDefault();
    }

    disconnectWallet(null);
  };

  const handleAction = async (e: any = null) => {
    if (e) {
      e.preventDefault();
    }

    if (active) {
      if (!(active && account && library)) {
        toast.warn("Please connect wallet.");
        return;
      }

      if (Number(assetTop) === 0 || Number(assetBottom) === 0) {
        toast.warn("Please enter valid values.");
        return;
      }

      if (chainId !== CHAIN_ID) {
        toast.info(`Please change network to ${NETWORK_NAME}.`);
        return;
      }

      let purchaseAmount = 0;
      let costAmount = 0;
      if (typeTop === "SDF") {
        purchaseAmount = Number(assetTop);
        costAmount = Number(assetBottom);
      } else {
        purchaseAmount = Number(assetBottom);
        costAmount = Number(assetTop);
      }
      costAmount += 0.0000001;

      if (balance < costAmount) {
        toast.error("Insufficient BNB in your wallet.");
        return;
      }

      if (purchaseAmount > availableSale) {
        toast.error("Insufficient SDF in presale contract.");
        return;
      }

      try {
        const presaleContract = new Contract(
          PRESALE_CONTRACT_ADDRESS,
          PRESALE_CONTRACT_ABI,
          library.getSigner()
        );

        let tx = await fetchWithCatchTxError(() => {
          return presaleContract.buy(
            ethers.BigNumber.from(purchaseAmount * 10 ** SHADOWFI_DECIMALS),
            {
              value: ethers.utils.parseEther(`${costAmount}`),
            }
          );
        });

        if (tx) {
          const txLink = `${BSC_SCAN_LINK}tx/${tx.transactionHash}`;

          toast.success(
            <div>
              <p>You successfully bought ShadowFi Tokens.</p>
              <br />
              <a href={txLink} target="_blank" rel="noreferrer">
                View on Block Explorer
              </a>
            </div>
          );

          getPresaleStatus();
        }
      } catch (e: any) {
        console.log(e);
      }
    } else {
      setIsShownWalletModal(true);
    }
  };

  const getPresaleStatus = async () => {
    const web3 = new Web3(PROVIDER_URL);

    const shadowFiContract = new web3.eth.Contract(
      // @ts-ignore
      SHADOWFI_CONTRACT_ABI,
      SHADOWFI_CONTRACT_ADDRESS
    );

    let isAirdropped = false;
    if (active && account) {
      isAirdropped = await shadowFiContract.methods
        .isAirdropped(account)
        .call();
    }
    setIsAirdropped(isAirdropped);

    const presaleContract = new web3.eth.Contract(
      // @ts-ignore
      PRESALE_CONTRACT_ABI,
      PRESALE_CONTRACT_ADDRESS
    );
    const saleStartSecs = await presaleContract.methods.getStartTime().call();
    const saleEndSecs = await presaleContract.methods.getStopTime().call();
    const totalSold = await presaleContract.methods
      .totalSoldTokenAmount()
      .call();
    const availableSale = await presaleContract.methods
      .availableForSaleTokenAmount()
      .call();
    const tokenCost = await presaleContract.methods.tokenCostBNB().call();
    const discountPercentage = await presaleContract.methods
      .discountPercentage()
      .call();

    setDiscountPercentage(discountPercentage / 100);
    if (new Date().getTime() < saleStartSecs * 1000) {
      setCooldownTime(saleStartSecs * 1000);
      setCooldownLabel("TOKEN SALE STARTS IN:");
      setCooldownSubLabel(
        `TOKEN SALE STARTS ${new Date(
          saleStartSecs * 1000
        ).toLocaleDateString()}`
      );
    } else if (
      saleStartSecs * 1000 < new Date().getTime() &&
      new Date().getTime() < saleEndSecs * 1000
    ) {
      setCooldownTime(saleEndSecs * 1000);
      setCooldownLabel("TOKEN SALE ENDS IN:");
      setCooldownSubLabel(
        `TOKEN SALE ENDS ${new Date(saleEndSecs * 1000).toLocaleDateString()}`
      );
    } else if (saleEndSecs * 1000 < new Date().getTime()) {
      setCooldownTime(new Date().getTime());
      setCooldownLabel("TOKEN SALE ENDED:");
      setCooldownSubLabel(
        `TOKEN SALE ENDED ${new Date(saleEndSecs * 1000).toLocaleDateString()}`
      );
    }

    setTotalSold(totalSold / 10 ** SHADOWFI_DECIMALS);
    setAvailableSale(availableSale / 10 ** SHADOWFI_DECIMALS);
    setTokenCostBNB(
      isAirdropped
        ? (tokenCost / 10 ** 18) * ((10000 - discountPercentage) / 10000)
        : tokenCost / 10 ** 18
    );
    setTotalFunded(
      ((totalSold / 10 ** SHADOWFI_DECIMALS) * 100) /
        (totalSold / 10 ** SHADOWFI_DECIMALS +
          availableSale / 10 ** SHADOWFI_DECIMALS)
    );
  };

  const onChangeAssetTop = (e: any) => {
    const value = e.target.value;
    if (!checkNumber(value)) {
      toast.warn("Please enter number value.");
      return;
    }
    setAssetTop(value);

    if (typeBottom === "BNB") {
      setAssetBottom(convertSDF2BNB(value, tokenCostBNB));
    } else {
      setAssetBottom(convertBNB2SDF(value, tokenCostBNB));
    }
  };

  const onChangeAssetBottom = (e: any) => {
    const value = e.target.value;
    if (!checkNumber(value)) {
      toast.warn("Please enter number value.");
      return;
    }
    setAssetBottom(value);

    if (typeTop === "BNB") {
      setAssetTop(convertSDF2BNB(value, tokenCostBNB));
    } else {
      setAssetTop(convertBNB2SDF(value, tokenCostBNB));
    }
  };

  useEffect(() => {
    const provider = window.localStorage.getItem(TAG_PROVIDER);
    if (provider) {
      for (let wallet of WALLETS) {
        if (provider === wallet.title) {
          connectWallet(wallet, null);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (active) {
      toast.success(`${truncateAddress(account)} connected`);
      setIsShownWalletModal(false);

      library.getBalance(account).then((result: any) => {
        setBalance(Number((result / 1e18).toFixed(2)));
      });
    }

    getPresaleStatus();
  }, [active, account, chainId]);

  // Random component
  const Completionist = () => <span>You are good to go!</span>;

  // Renderer callback with condition
  // @ts-ignore
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <div className="timerOuter">
          <div className="time">
            {days} <div className="tag">DAYS</div>
          </div>
          <div className="time">
            {hours} <div className="tag">HOURS</div>
          </div>
          <div className="time">
            {minutes} <div className="tag">MINUTES</div>
          </div>
          <div className="time">
            {seconds} <div className="tag">SECONDS</div>
          </div>
        </div>
      );
    }
  };

  return (
    <LandingMain>
      <Leftblock
        className=" wow fadeInLeft"
        data-wow-duration="0.5s"
        data-wow-delay="0s"
      >
        <LeftContent>
          <a href="https://ShadowFi.com" target="_blank" rel="noreferrer">
            <img src={logo} alt="example" className="siteLogo" />
          </a>
          <h1>
            DeFi finance, <span>reloaded</span>. Safe, simple, private
          </h1>
          <p>
            ShadowFi is the reawakening of Don’t KYC, the first step towards
            private spending and financial freedom. After 12 months, the team
            has created a more transparent approach, more utility, and easier
            spending. With its razor-sharp branding and world-first ShadowStrike
            dynamic LP engine, ShadowFi is the most anticipated BSC presale of
            the year.{" "}
          </p>
          <Grid container spacing={2} className="threegrid">
            <Grid item xs={12} md={4}>
              <div className="grdcontent">
                <h6>TOTAL FOR PRESALE</h6>
                <h4>10,000,000 SDF</h4>
                <LineChart width={200} height={100} data={data}>
                  <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="#296fff"
                    dot={false}
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#101f38"
                    dot={false}
                    strokeWidth={3}
                  />
                </LineChart>
              </div>
            </Grid>
            <Grid item xs={12} md={4}>
              <div className="grdcontent">
                <h6>TOTAL LOCKED LIQUIDITY</h6>
                <h4>1200 BNB</h4>
                {/* <img
                    src={
                        require("./assets/svgline.png").default
                    }
                    alt=""
                /> */}
                <LineChart width={200} height={100} data={data}>
                  <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="#296fff"
                    dot={false}
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#101f38"
                    dot={false}
                    strokeWidth={3}
                  />
                </LineChart>
              </div>
            </Grid>
            <Grid item xs={12} md={4}>
              <div className="grdcontent">
                <h6>PCS LISTING PRICE</h6>
                <h4>0.00012 BNB</h4>
                <LineChart width={200} height={100} data={data}>
                  <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="#296fff"
                    dot={false}
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#101f38"
                    dot={false}
                    strokeWidth={3}
                  />
                </LineChart>
              </div>
            </Grid>
          </Grid>
        </LeftContent>
      </Leftblock>
      <Rightblock
        className=" wow fadeInRight"
        data-wow-duration="0.8s"
        data-wow-delay="0.3s"
      >
        <RightblockContent>
          <div className="tokensale">
            <div className="tokenheading">{cooldownLabel}</div>
            {cooldownTime > 0 && (
              <Countdown date={cooldownTime} renderer={renderer} />
            )}
            <div className="tokenslebtm">{cooldownSubLabel}</div>
          </div>
          <div className="progressslider">
            <div className="prginner">
              <Tooltip
                title={`Funded: ${totalFunded.toFixed(
                  2
                )} % = ${totalSold.toFixed(3)} SDF`}
                placement="top"
                arrow
                open
              >
                <BorderLinearProgress
                  variant="determinate"
                  value={totalFunded}
                />
              </Tooltip>
            </div>
          </div>
          <div className="purchaseblock">
            <div className="purcbx">
              <h5>{typeTop === "SDF" ? "Purchase Amount" : "Cost"}</h5>
              <div className="iptOuter">
                <input
                  placeholder="0"
                  value={assetTop}
                  onChange={onChangeAssetTop}
                />
                {typeTop === "BNB" ? (
                  <Select
                    defaultValue="SDF"
                    disabled={true}
                    suffixIcon={
                      <img
                        width="11"
                        height="7"
                        id="img1"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAHCAMAAADpsEdvAAAAAXNSR0IB2cksfwAAADlQTFRF////////////////////////////////////////////////////////////////////////////tBAeHgAAABN0Uk5TRsMPAMn/xwoV174c3Aze7CTkyCMYx+sAAABASURBVHicJcZBEoAgDAPAQAiFFhH8/2OVcU8LpMwjJ6Co2lerKmhdbjRXb2AM+eUaQZAxdWsGz7m29uJ/rueUL0dAAfUSl2OvAAAAAElFTkSuQmCC"
                      />
                    }
                    style={{ width: 130 }}
                    onChange={(e) => handleChange(e, "top")}
                    value={typeTop}
                  >
                    <Option value="SDF">
                      <img src={require("./assets/sdf.png").default} alt="" />{" "}
                      SDF
                    </Option>
                    <Option value="BNB">
                      <img src={require("./assets/bnb.png").default} alt="" />{" "}
                      BNB
                    </Option>
                  </Select>
                ) : (
                  <Select
                    defaultValue="BNB"
                    disabled={true}
                    suffixIcon={
                      <img
                        width="11"
                        height="7"
                        id="img1"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAHCAMAAADpsEdvAAAAAXNSR0IB2cksfwAAADlQTFRF////////////////////////////////////////////////////////////////////////////tBAeHgAAABN0Uk5TRsMPAMn/xwoV174c3Aze7CTkyCMYx+sAAABASURBVHicJcZBEoAgDAPAQAiFFhH8/2OVcU8LpMwjJ6Co2lerKmhdbjRXb2AM+eUaQZAxdWsGz7m29uJ/rueUL0dAAfUSl2OvAAAAAElFTkSuQmCC"
                      />
                    }
                    style={{ width: 130 }}
                    onChange={(e) => handleChange(e, "top")}
                    value={typeTop}
                  >
                    <Option value="SDF">
                      <img src={require("./assets/sdf.png").default} alt="" />{" "}
                      SDF
                    </Option>
                    <Option value="BNB">
                      <img src={require("./assets/bnb.png").default} alt="" />{" "}
                      BNB
                    </Option>
                  </Select>
                )}
              </div>
            </div>
            <div className="purcbx">
              <h5>{typeBottom === "SDF" ? "Purchase Amount" : "Cost"}</h5>
              <div className="iptOuter">
                <input
                  placeholder="0"
                  value={assetBottom}
                  onChange={onChangeAssetBottom}
                />
                {typeBottom === "SDF" ? (
                  <Select
                    defaultValue="BNB"
                    disabled={true}
                    suffixIcon={
                      <img
                        width="11"
                        height="7"
                        id="img1"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAHCAMAAADpsEdvAAAAAXNSR0IB2cksfwAAADlQTFRF////////////////////////////////////////////////////////////////////////////tBAeHgAAABN0Uk5TRsMPAMn/xwoV174c3Aze7CTkyCMYx+sAAABASURBVHicJcZBEoAgDAPAQAiFFhH8/2OVcU8LpMwjJ6Co2lerKmhdbjRXb2AM+eUaQZAxdWsGz7m29uJ/rueUL0dAAfUSl2OvAAAAAElFTkSuQmCC"
                      />
                    }
                    style={{ width: 130 }}
                    onChange={(e) => handleChange(e, "bottom")}
                    value={typeBottom}
                  >
                    <Option value="SDF">
                      <img src={require("./assets/sdf.png").default} alt="" />{" "}
                      SDF
                    </Option>
                    <Option value="BNB">
                      <img src={require("./assets/bnb.png").default} alt="" />{" "}
                      BNB
                    </Option>
                  </Select>
                ) : (
                  <Select
                    defaultValue="SDF"
                    disabled={true}
                    suffixIcon={
                      <img
                        width="11"
                        height="7"
                        id="img1"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAHCAMAAADpsEdvAAAAAXNSR0IB2cksfwAAADlQTFRF////////////////////////////////////////////////////////////////////////////tBAeHgAAABN0Uk5TRsMPAMn/xwoV174c3Aze7CTkyCMYx+sAAABASURBVHicJcZBEoAgDAPAQAiFFhH8/2OVcU8LpMwjJ6Co2lerKmhdbjRXb2AM+eUaQZAxdWsGz7m29uJ/rueUL0dAAfUSl2OvAAAAAElFTkSuQmCC"
                      />
                    }
                    style={{ width: 130 }}
                    onChange={(e) => handleChange(e, "bottom")}
                    value={typeBottom}
                  >
                    <Option value="SDF">
                      <img src={require("./assets/sdf.png").default} alt="" />{" "}
                      SDF
                    </Option>
                    <Option value="BNB">
                      <img src={require("./assets/bnb.png").default} alt="" />{" "}
                      BNB
                    </Option>
                  </Select>
                )}
              </div>
            </div>
          </div>
          <div className="cntntbx">
            <div className="flxrow">
              <div>Rate:</div>
              <div>1 SDF = {tokenCostBNB} BNB</div>
            </div>
            <div className="flxrow">
              <div>Min Buy:</div>
              <div>1 SDF</div>
            </div>
            <div className="flxrow">
              <div>Max Buy:</div>
              <div>1,000,000 SDF</div>
            </div>
            <div className="flxrow">
              <div>Your Discount:</div>
              {isAirdropped ? (
                <div>{(discountPercentage + 2.5).toFixed(2)} %</div>
              ) : (
                <div>2.50 %</div>
              )}
            </div>
          </div>
          <Button className="btmbtn" variant="contained" onClick={handleAction}>
            {active ? "CONFIRM BUY" : "CONNECT WALLET"}
          </Button>
        </RightblockContent>
      </Rightblock>

      {isShownWalletModal && (
        <WalletModal>
          <ModalWrapper>
            <CloseButton onClick={() => setIsShownWalletModal(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-x-lg"
                viewBox="0 0 16 16"
              >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
              </svg>
            </CloseButton>
            <ModalTitle>CONNECT YOUR WALLET</ModalTitle>
            {WALLETS.map((wallet, index) => {
              return (
                <Button
                  className="connect-button"
                  variant="contained"
                  key={index}
                  onClick={(e) => connect(e, wallet)}
                >
                  {wallet.title}
                </Button>
              );
            })}
          </ModalWrapper>
        </WalletModal>
      )}

      {loading && <WalletModal />}
    </LandingMain>
  );
};

const LandingMain = styled.div`
  background: #050d21;
  min-height: 100vh;
  display: flex;
  overflow-x: hidden;
  @media screen and (max-width: 1300px) {
    flex-direction: column;
    min-height: unset;
  }
`;
const Leftblock = styled.div`
  min-height: 100vh;
  width: 70%;
  background: url("./bg.png");
  padding: 50px 10% 80px 10%;
  box-sizing: border-box;
  background-size: auto 100%;
  background-position: bottom left;
  background-repeat: no-repeat;
  @media screen and (max-width: 1300px) {
    width: 100%;
    min-height: unset;
  }
  .logo {
    height: 20px;
    width: auto;
    margin-bottom: 40px;
  }
  h1 {
    font-weight: 600;
    font-size: 46px;
    max-width: 600px;
    span {
      color: #296fff;
    }
  }
  p {
    color: #8d9cbf;
    margin-top: 30px;
    margin-bottom: 30px;
  }
  .threegrid {
    margin-top: 40px;
    .grdcontent {
      background-color: #060e21;
      text-align: center;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      img {
        width: 100%;
        margin-top: 20px;
        margin-bottom: 30px;
      }
      h6 {
        color: #8d9cbf;
        font-weight: 500;
        font-size: 12px;
        text-transform: uppercase;
      }
      h4 {
        font-weight: 600;
        font-size: 17px;
        text-transform: uppercase;
        margin-top: 5px;
        margin-bottom: 20px;
      }
    }
  }
`;

const LeftContent = styled.div`
  width: 100%;
`;

const RightblockContent = styled.div`
  max-width: 350px;
  width: 100%;
`;
const Rightblock = styled.div`
  position: relative;
  width: 30%;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: Center;
  box-sizing: border-box;
  @media screen and (max-width: 1300px) {
    width: 100%;
    min-height: unset;
    padding: 60px 20px;
  }
  .tokensale {
    .tokenheading {
      text-transform: uppercase;
      font-size: 18px;
      color: #fff;
    }
    .timerOuter {
      display: flex;
      align-items: center;
      margin-top: 12px;
      margin-bottom: 10px;
      .time {
        display: flex;
        flex-direction: column;
        background: #111b34;
        width: 80px;
        height: 90px;
        align-items: center;
        justify-content: center;
        margin: 0 5px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 24px;
        color: #fff;
        .tag {
          margin-top: 0px;
          font-size: 12px;
          font-weight: 400;
          color: #8d9cbf;
        }
      }
    }
    .tokenslebtm {
      text-align: right;
      text-transform: uppercase;
      font-size: 13px;
      color: #fff;
    }
  }
  .progressslider {
    margin-bottom: 26px;
    margin-top: 50px;
    .prginner {
      border: 8px solid #111b33;
      border-radius: 100px;
      .MuiLinearProgress-root {
        background: #0d273f;
      }
    }
  }
  .purchaseblock {
    .purcbx {
      margin-bottom: 16px;
      h5 {
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 8px;
      }
      .iptOuter {
        border-radius: 10px;
        background-color: #050915;
        border: 2px solid #0b1939;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .ant-select-selector {
          background: transparent !important;
          color: #fff !important;
          border: 0 !important;
          img {
            height: 18px;
            margin-right: 3px;
            margin-top: -2px;
          }
        }
      }
      input {
        padding: 10px 10px;
        width: 100%;
        border: 0 !important;
        outline: 0;
        background: transparent;
        color: #fff;
      }
    }
  }

  .cntntbx {
    .flxrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 10px 0;
      div {
        color: #fff;
        font-size: 14px;
        &:first-child {
          color: #8d9cbf;
        }
      }
    }
  }
  .btmbtn {
    width: 100%;
    margin-top: 20px;
  }
`;

const WalletModal = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  background: #ffffff88;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 12px
  z-index: 9999;
`;

const ModalWrapper = styled.div`
  position: relative;
  width: 600px;
  height: 366px;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: 850px) {
    width: 350px;
  }

  .connect-button {
    width: 50%;
    margin: 10px;

    @media (max-width: 850px) {
      width: 90%;
    }
  }
`;

const CloseButton = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  color: white;
  cursor: pointer;
`;

const ModalTitle = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 26px;
  text-align: center;
  line-height: 140%;
  letter-spacing: 0.1em;
  color: #ffffff;
`;

export default Landing;
