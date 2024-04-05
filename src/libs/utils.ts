import {
  CRYPTO_PRICE_FETCH_API,
  AVAX_ROUNDED_PRICE,
  SHADOWFI_DECIMALS,
} from "./constants";

type ErrorData = {
  code: number;
  message: string;
};

type TxError = {
  data: ErrorData;
  error: string;
};

export const isEqualAddress = (addr1: string, addr2: string) => {
  return addr1.toLocaleLowerCase() === addr2.toLocaleLowerCase();
};

export const isUserRejected = (err: any) => {
  // provider user rejected error code
  return typeof err === "object" && "code" in err && err.code === 4001;
};

export const isGasEstimationError = (err: TxError): boolean =>
  err?.data?.code === -32000;

export const truncateAddress = (address: string | null | undefined) => {
  if (!address) return "No Account";
  const match = address.match(
    /^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const toHex = (num: any) => {
  const val = Number(num);
  return "0x" + val.toString(16);
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * max) + min;
};

export const fetchCryptoPricesCoingecko = async () => {
  try {
    const res = await fetch(CRYPTO_PRICE_FETCH_API);
    const data = await res.json();
    if (data.length > 0 && data[0].current_price) {
      return data[0].current_price;
    }
  } catch (e) {
    console.log(e);
  }
  return AVAX_ROUNDED_PRICE;
};

export const setDecimals = (numberValue: number, decimals: number) => {
  const number = numberValue.toString();
  let numberAbs = number.split(".")[0];
  let numberDecimals = number.split(".")[1] ? number.split(".")[1] : "";
  while (numberDecimals.length < decimals) {
    numberDecimals += "0";
  }
  return numberAbs + numberDecimals;
};

export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const checkNumber = (value: string) => {
  if (value === "") return true;
  const reg = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/;
  return reg.test(value);
};

export const convertBNB2SDF = (bnbAmount: any, rate: any) => {
  if (bnbAmount === "0") return "0";
  const result = (Number(bnbAmount) / Number(rate)).toString();
  if (result.includes(".")) {
    const integers = result.split(".")[0];
    const decimals = result.split(".")[1];
    if (decimals.length > SHADOWFI_DECIMALS) {
      return integers + "." + decimals.substring(0, SHADOWFI_DECIMALS);
    }
  }
  return result;
};

export const convertSDF2BNB = (SDFAmount: any, rate: any) => {
  if (SDFAmount === "0") return "0";
  const result = (Number(SDFAmount) * Number(rate)).toString();
  if (result.includes(".")) {
    const integers = result.split(".")[0];
    const decimals = result.split(".")[1];
    if (decimals.length > 18) {
      return integers + "." + decimals.substring(0, 18);
    }
  }
  return result;
};
