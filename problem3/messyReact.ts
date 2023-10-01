import React, { useEffect, useState, useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

// Import useWalletBalances and WalletRow if not already imported

class Datasource {
  constructor(private url: string) {}

  async getPrices() {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      const prices = await response.json();
      return prices;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  // Assuming useWalletBalances is correctly imported and used here
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
  }, [/* Add dependencies that trigger a re-fetch here if needed */]);

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
        return 20;
      case 'Neo':
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

  // Assuming WalletRow and classes are correctly imported and used here

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
}

export default WalletPage;
