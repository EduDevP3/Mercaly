const Price = ({
  amount,
  currencyCode = 'USD',
  ...props
}: {
  amount: string | number;
  currencyCode: string;
} & React.ComponentProps<'p'>) => (
  <p suppressHydrationWarning={true} {...props}>
    {`${new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount)} ${currencyCode}`}
  </p>
);

export default Price;
