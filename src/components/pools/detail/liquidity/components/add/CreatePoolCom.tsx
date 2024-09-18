import React,{useState, useContext, useEffect} from 'react';
import { PoolInfo } from '@/services/swapV3';
import { TokenMetadata } from '@/services/ft-contract';
import BigNumber from 'bignumber.js';
import { toPrecision } from '@/utils/numbers';
import { getPointByPrice } from '@/services/commonV3';
import { create_pool } from '@/services/swapV3';
import { FormattedMessage } from 'react-intl';
import { toRealSymbol } from '@/services/farm';
import { ConnectToNearBtn } from '@/components/common/Button';
import { ButtonTextWrapper } from '@/components/common/Button';
import { SWitchButton } from '@/components/swap/icons';
import { useAccountStore } from '@/stores/account';

export const POINTDELTAMAP = {
  100: 1,
  400: 8,
  2000: 40,
  10000: 200,
};

export function CreatePoolComponent({
    currentSelectedPool,
    tokenX,
    tokenY,
    tokenPriceList,
    buttonSort,
  }: {
    currentSelectedPool: PoolInfo;
    tokenX: TokenMetadata;
    tokenY: TokenMetadata;
    tokenPriceList: Record<string, any>;
    buttonSort: boolean;
  }) {
    const [createPoolButtonLoading, setCreatePoolButtonLoading] = useState(false);
    const [createPoolRate, setCreatePoolRate] = useState<string>('');
    const [rateStatus, setRateStatus] = useState(true);
    const accountStore = useAccountStore()
    // const { globalState } = useContext(WalletContext);
    const isSignedIn = accountStore.getAccountId();
    useEffect(() => {
      if (createPoolRate) {
        const rateString = new BigNumber(1).dividedBy(createPoolRate).toFixed();
        setCreatePoolRate(toPrecision(rateString, 6));
      }
    }, [buttonSort]);
    function getCurrentPriceValue(token: TokenMetadata) {
      if (token) {
        const price = tokenPriceList[token.id]?.price;
        return price ? `${'$' + price}` : '$-';
      } else {
        return '$-';
      }
    }
    function createPool() {
      setCreatePoolButtonLoading(true);
      const { fee } = currentSelectedPool;
      const pointDelta = POINTDELTAMAP[fee];
      let decimalRate =
        Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
      let init_point = getPointByPrice(
        pointDelta,
        createPoolRate,
        decimalRate,
        true
      );
      const arr = [tokenX.id, tokenY.id];
      arr.sort();
      if (arr[0] !== tokenX.id) {
        decimalRate =
          Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
        init_point = getPointByPrice(
          pointDelta,
          new BigNumber(1).dividedBy(createPoolRate).toFixed(),
          decimalRate,
          true
        );
        create_pool({
          token_a: tokenY.id,
          token_b: tokenX.id,
          fee: currentSelectedPool.fee,
          init_point,
        });
      } else {
        create_pool({
          token_a: tokenX.id,
          token_b: tokenY.id,
          fee: currentSelectedPool.fee,
          init_point,
        });
      }
    }
    function switchRate() {
      setRateStatus(!rateStatus);
    }
    function getPoolRate() {
      if (createPoolRate) {
        const rate = 1 / +createPoolRate;
        return toPrecision(rate.toString(), 6);
      }
      return '';
    }
    // const mobileDevice = isMobile();
    return (
      <div
        className={`w-full xs:w-full mr-6 md:w-full flex flex-col justify-between  self-stretch xs:mt-5 md:mt-5`}
      >
        <div className="text-white font-bold text-base">
          <FormattedMessage
            id="pool_creation"
            defaultMessage="Pool creation"
          ></FormattedMessage>
          :
        </div>
        <div className="relative flex-grow bg-black bg-opacity-10 rounded-xl px-4 py-7 mt-3 xs:px-2 md:px-2">
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-sm text-white">
                <FormattedMessage
                  id="pool_creation_tip"
                  defaultMessage="There is no existing pool for the selected tokens. To create the pool, you must set the pool rate, by providing corresponding amounts."
                ></FormattedMessage>
              </p>
            </div>
            <div className="xs:mt-20 md:mt-20">
              <p className="text-base text-white">
                <FormattedMessage
                  id="starting_price"
                  defaultMessage="Starting Price"
                ></FormattedMessage>
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="whitespace-nowrap mr-2">
                  1 {toRealSymbol(tokenX?.symbol)} =
                </span>
                <div className="flex items-center justify-between rounded-xl bg-black bg-opacity-20 px-3 h-12">
                  <input
                    type="number"
                    placeholder="0.0"
                    className="text-xl font-bold"
                    value={createPoolRate}
                    onChange={({ target }) => {
                      setCreatePoolRate(target.value);
                    }}
                  />
                  <span className="text-base text-white ml-3">
                    {toRealSymbol(tokenY?.symbol)}
                  </span>
                </div>
              </div>
              <div className="flex items-center flex-wrap justify-between mt-3.5">
                <span className="text-xs text-v3LightGreyColor mr-2 mb-2">
                  <FormattedMessage
                    id="current_price"
                    defaultMessage="Current Price"
                  ></FormattedMessage>
                </span>
                <div className="flex items-center text-xs text-white mb-2">
                  {rateStatus ? (
                    <div className="mr-0.5">
                      1 {toRealSymbol(tokenX?.symbol)}
                      <span className="text-v3LightGreyColor mx-0.5">
                        ({getCurrentPriceValue(tokenX)})
                      </span>
                      <label className="mx-0.5">=</label>
                      <span>
                        {createPoolRate} {toRealSymbol(tokenY?.symbol)}
                      </span>
                    </div>
                  ) : (
                    <div className="mr-0.5">
                      1 {toRealSymbol(tokenY?.symbol)}
                      <span className="text-v3LightGreyColor mx-0.5">
                        ({getCurrentPriceValue(tokenY)})
                      </span>
                      <label className="mx-0.5">=</label>
                      <span>
                        {getPoolRate()} {toRealSymbol(tokenX?.symbol)}
                      </span>
                    </div>
                  )}
  
                  <SWitchButton
                    onClick={switchRate}
                    className="cursor-pointer ml-1.5"
                  ></SWitchButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isSignedIn ? (
          <div
            color="#fff"
            className={`relative z-50 w-full h-12 mt-5 text-center text-base text-white focus:outline-none ${
              +createPoolRate <= 0 ? 'opacity-40' : ''
            }`}
            // loading={createPoolButtonLoading}
            // disabled={createPoolButtonLoading || +createPoolRate <= 0}
            // btnClassName={`${+createPoolRate <= 0 ? 'cursor-not-allowed' : ''}`}
            onClick={createPool}
          >
            <ButtonTextWrapper
              loading={createPoolButtonLoading}
              Text={() => (
                <>
                  <FormattedMessage
                    id="create_a_pool"
                    defaultMessage="Create a Pool"
                  ></FormattedMessage>
                </>
              )}
            />
          </div>
        ) : (
          <ConnectToNearBtn></ConnectToNearBtn>
        )}
      </div>
    );
  }
  
