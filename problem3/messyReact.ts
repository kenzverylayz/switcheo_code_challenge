import React, { useEffect, useState, useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

class Datasource {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getPrices(): Promise<{ [currency: string]: number }> {
    try {
      const response = await fetch(this.url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}


interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const datasource = new Datasource("https://interview.switcheo.com/prices.json");
    datasource.getPrices()
      .then(prices => {
        setPrices(prices);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  enum ValidBlockchains {
    Osmosis = 'Osmosis',
    Ethereum = 'Ethereum',
    Arbitrum = "Arbitrum",
    Zilliqa = 'Zilliqa',
    Neo = 'Neo',
  }

  type Blockchain = ValidBlockchains | string;


  const getPriority = (blockchain: Blockchain): number => {
    switch (blockchain) {
      case ValidBlockchains.Osmosis:
        return 100;
      case ValidBlockchains.Ethereum:
        return 50;
      case ValidBlockchains.Arbitrum:
        return 30;
      case ValidBlockchains.Zilliqa:
        return 20;
      case ValidBlockchains.Neo:
        return 20;
      default:
        return -99;
    }
  }

 
  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      if (balancePriority > -99 && balance.amount <= 0) {
        return true;
      }
      return false;
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      return 0;
    });
  }, [balances, prices]);


  const balanceRows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;

    const formattedBalance: FormattedWalletBalance = {
      ...balance,
      formatted: balance.amount.toFixed(),
    };

    return (
      <WalletRow
        className={classes.row} 
        key={index}
        amount={formattedBalance.amount}
        usdValue={usdValue}
        formattedAmount={formattedBalance.formatted}
      />
    );
  });


  return (
    <div {...rest}>
      {balanceRows} 
    </div>
  );
}

export default WalletPage;
