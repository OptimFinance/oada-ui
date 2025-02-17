export const faqContent = [
  {
    title: 'What is an SPO Bond?',
    text:"An SPO Bond is a loan agreement for non-custodial lending of staking rights to Stake Pool Operators from a pool of lenders. A smart contract locks lender’s ADA and allows a borrower to attach their stake key for a maximum duration as long as conditions are met (interest paid)",
    id: '1',
  },
  {
    title: 'What is an OPool?',
    text: "A pending OPool is a Borrow Offer that is still pooling funds to completely fill up the required ADA necessary to execute the bond.",
    id: '2',
  },
  {
    title: 'What is a Borrow Offer?',
    text: "Borrow Offers are the terms (duration and interest) an SPO is willing to agree to if enough liquidity is provided for their Stake Pool.",
    id: '3',
  },
  {
    title: 'What are EQT (Equity Tokens)?',
    text: "EQ Tokens are placeholder tokens that represent a user’s ownership share of an OPool that will fund a bond once full. After bond activation, they can be converted to Bond Tokens.",
    id: '4',
  },
  {
    title: 'What are BT (Bond Tokens)?',
    text: "Bond Tokens are tokens denominating a user’s fractional position of a bond loan. As Cardano Native Tokens, they can be used to interact with the wider DeFi ecosystem, such as marketplaces and lending protocols. At maturity they can be exchanged for the underlying ADA plus all accrued interest.",
    id: '5',
  },
  {
    title: 'What is a Bond NFT?',
    text: 'A token that allows you to cancel a particular pending bond, or change staking rights of a particular active bond. It indicates ownership of the borrow side of a bond.',
    id: '14' 
  },
  {
    title: 'What is the motivation for SPOs to use these bonds?',
    text: "The hardest part of running a stake pool is attracting the first 1M ADA of liquidity because until you have enough live stake accumulated, the staking returns are well below that of the average competitors. This essentially forces new SPOs to ask their delegators for support while offering a lesser return than the average established stake pool. This unfortunate dynamic is the reason most new pools end up having to shut down before achieving sustainability.",
    id: '6',
  },
  {
    title: 'What is the motivation for Lenders to fund these bonds?',
    text: "While liquidity providers receive an optimal and higher return than average when subsidies are included, this product is meant to facilitate and encourage the community’s support of network decentralization by lowering the entry barriers for small and new stake pools.",
    id: '7',
  },
  {
    title: 'Can I get my ADA back from a non-active OPool?',
    text: "If you hold EQ tokens and these EQ tokens are part of an OPool that is pending (not yet ‘active’ in UI) a user can use them to withdraw their ADA from the OPool.",
    id: '8',
  },
  {
    title: 'When can a bond be cancelled/closed?',
    text: "A pending bond can be cancelled 14 days after it has been created. An active bond can be closed if the SPO fails to meet the terms of the bond by not providing enough interest to stay above the 1 month (six epochs) Interest Buffer minimum threshold. An active bond can also be closed once it reaches maturity.",
    id: '9',
  },
  {
    title: 'Is there a penalty for canceled bonds?',
    text: "At cancellation, liquidity providers receive an additional six epochs of Interest Buffer and can access the underlying liquidity immediately.",
    id: '10',
  },
  {
    title: 'Do I have to monitor the health of my bonds?',
    text: "It is recommended for bond holders to check their bonds remain active and have not been closed at least once a month.",
    id: '11',
  },
  {
    title: 'Can I sell my Bond Tokens to access liquidity?',
    text: "Absolutely, as Cardano Native Tokens you are able to trade Bond Tokens in secondary marketplaces or peer-to-peer exchanges. Whatever party holds the bond token at maturity can then redeem the underlying ADA plus all accumulated interest.",
    id: '12',
  },
  {
    title: 'Can Bond Tokens be used as collateral in lending protocols?',
    text: "Yes, as regular CNTs Bond Tokens can be used as collateral in supporting protocols. As of now, Liquid Finance has committed to onboarding Bond Tokens as collateral and may actually be supported at launch.",
    id: '13',
  },
];
