import { useState } from "react";
import links from "../../assets/icons/cylinder-512.svg";
import bond from "../../assets/icons/diamond-512.svg";
import pool from "../../assets/icons/donut-512.svg";
import offer from "../../assets/icons/octagon-512.svg";
import equityToken from "../../assets/icons/sphere-512.svg";
import styles from "./index.module.scss";
import FaqCard from "./card";
// import { faqContent } from "./mock";
import AccordionItem from "./AccordionItem";
import CustomTitle from "src/components/Title";
import { Text } from "src/components/ui/typography";
// import { v4 as uuidv4 } from 'uuid';

const faqIcons = [
  {
    id: "1",
    title: "What is a Bond?",
    image: bond,
  },
  {
    id: "2",
    title: "What is a Borrow Offer?",
    image: offer,
  },
  {
    id: "3",
    title: "What is an OPool?",
    image: pool,
  },
  {
    id: "6",
    title: "What is an Equity Token?",
    image: equityToken,
  },
  {
    id: "",
    title: "More Useful Links",
    image: links,
  },
];

export const faqContent = [
  {
    title: "What is an SPO Bond?",
    text: "",
    children: (
      <>
        <Text tone="muted">
          An SPO Bond is a loan agreement for non-custodial lending of staking
          rights to Stake Pool Operators from a pool of lenders.
        </Text>
        <Text tone="muted">
          A smart contract locks lender’s ADA and allows a borrower to attach
          their stake key for a maximum duration as long as conditions are met
          (interest paid)
        </Text>
      </>
    ),
    id: "1",
  },
  {
    title: "What is a Borrow Offer?",
    text: "",
    children: (
      <Text tone="muted">
        Borrow Offers are the terms (duration and interest) an SPO is willing to
        agree to if enough liquidity is provided for their Stake Pool.
      </Text>
    ),
    id: "2",
  },
  {
    title: "What is a Pending OPool?",
    text: "",
    children: (
      <Text tone="muted">
        A Pending OPool is a Borrow Offer that is still pooling funds to
        completely fill up the required ADA necessary to execute the bond.
      </Text>
    ),
    id: "3",
  },
  {
    title: "What is the motivation for SPOs to use these bonds?",
    text: "",
    children: (
      <Text tone="muted">
        The hardest part of running a stake pool is attracting the first 1M ADA
        of liquidity because until you have enough live stake accumulated, the
        staking returns are well below that of the average competitors. This
        essentially forces new SPOs to ask their delegators for support while
        offering a lesser return than the average established stake pool. This
        unfortunate dynamic is the reason most new pools end up having to shut
        down before achieving sustainability.
      </Text>
    ),
    id: "4",
  },
  {
    title: "What is the motivation for Lenders to fund these bonds?",
    text: "",
    children: (
      <Text tone="muted">
        While liquidity providers receive an optimal and higher return than
        average when subsidies are included, this product is meant to facilitate
        and encourage the community’s support of network decentralization by
        lowering the entry barriers for small and new stake pools.
      </Text>
    ),
    id: "5",
  },
  {
    title: "What are EQT (Equity Tokens)?",
    text: "",
    children: (
      <Text tone="muted">
        EQ Tokens are placeholder tokens that represent a user’s ownership share
        of an OPool that will fund a bond once full. After bond activation, they
        can be converted to BT (Bond Tokens).
      </Text>
    ),
    id: "6",
  },
  {
    title: "Can I get my ADA back from a non-active OPool?",
    text: "",
    children: (
      <>
        <Text tone="muted">
          {
            "If you hold EQ tokens and these EQ tokens are part of an OPool that is not yet activated (pool cards located in ‘Your Page > Pending OPools’ correspond to such pending OPools) you can withdraw ADA corresponding to the number of EQ tokens you have from the OPool."
          }
        </Text>
        <Text tone="muted">
          Note that if you withdraw the last remaining ADA from the OPool the
          OPool will be cancelled.
        </Text>
      </>
    ),
    id: "7",
  },
  {
    title: "What are BT (Bond Tokens)?",
    text: "",
    children: (
      <Text tone="muted">
        Bond Tokens are tokens denominating a user’s fractional position of a
        bond loan. As Cardano Native Tokens, they can be used to interact with
        the wider DeFi ecosystem, such as marketplaces and lending protocols. At
        maturity they can be exchanged for the underlying ADA plus all accrued
        interest.
      </Text>
    ),
    id: "8",
  },
  {
    title: "What is the difference between EQTs and BTs?",
    text: "",
    children: (
      <Text tone="muted">
        EQTs represent equity of a pool waiting to fill up a borrow offer and
        can be redeemable for ADA up until the pool fills up and the bond is
        executed. BTs represent share ownership of an active bond and are only
        redeemable at maturity.
      </Text>
    ),
    id: "9",
  },
  {
    title: "When can a bond be cancelled/closed?",
    text: "",
    children: (
      <Text tone="muted">
        A pending bond can be cancelled 14 days after it has been created. An
        active bond can be closed if the SPO fails to meet the terms of the bond
        by not providing enough interest to stay above the 1 month (six epochs)
        Interest Buffer minimum threshold. An active bond can also be closed
        once it reaches maturity.
      </Text>
    ),
    id: "10",
  },
  {
    title: "Is there a penalty for a bond closing before maturity?",
    text: "",
    children: (
      <Text tone="muted">
        At cancellation, liquidity providers receive up to an additional six
        epochs of Interest Buffer and can access the underlying liquidity
        immediately.
      </Text>
    ),
    id: "11",
  },
  {
    title: "Do I have to monitor the health of my bonds?",
    text: "",
    children: (
      <Text tone="muted">
        It is recommended for bond holders to check their bonds remain active
        and have not been closed at least once a month.
      </Text>
    ),
    id: "12",
  },
  {
    title: "Can I sell my Bond Tokens to access liquidity?",
    text: "",
    children: (
      <Text tone="muted">
        Absolutely, as Cardano Native Tokens you are able to trade Bond Tokens
        in secondary marketplaces or peer-to-peer exchanges. Whatever party
        holds the bond token at maturity can then redeem the underlying ADA plus
        all accumulated interest.
      </Text>
    ),
    id: "13",
  },
  {
    title: "Can Bond Tokens be used as collateral in lending protocols?",
    text: "",
    children: (
      <Text tone="muted">
        Yes, as regular CNTs Bond Tokens can be used as collateral in supporting
        protocols. As of now, Liquid Finance has committed to onboarding Bond
        Tokens as collateral and may actually be supported at launch.
      </Text>
    ),
    id: "14",
  },
  {
    title: "Why do EQTs have a weird name inside my wallet?",
    text: "",
    children: (
      <Text tone="muted">
        These are the auto-generated Bond Name hashes that link to a specific
        OPool position.
      </Text>
    ),
    id: "15",
  },
  {
    title: "How do I redeem underlying ADA plus interest at maturity?",
    text: "",
    children: (
      <Text tone="muted">
        {
          "You redeem ADA by clicking the Redeem button on cards at ‘Your Page > Bond Positions’ in the ‘Closed Position’ section."
        }
      </Text>
    ),
    id: "16",
  },
  {
    title: "Why do I have the option to close bonds that I don't own?",
    text: "",
    children: (
      <Text tone="muted">
        This interaction is permissionless so a bot can automate this
        transaction and improve the overall user experience.
      </Text>
    ),
    id: "17",
  },
  {
    title: "Why can I pay interest on bonds I haven't issued?",
    text: "",
    children: (
      <Text tone="muted">
        This interaction is permissionless so anyone can donate subsidies to
        these bonds.
      </Text>
    ),
    id: "18",
  },
  {
    title: `I'm getting the error "Too close to the end of an Epoch?"`,
    text: "",
    children: (
      <Text tone="muted">
        Our smart contracts construct transactions in a way that treats each
        epoch as a discrete variable, thus transactions for bond purchases are
        only valid within a single epoch. If you get this error, please submit
        another transaction in a minute or two.
      </Text>
    ),
    id: "19",
  },
  {
    title: `I'm getting the error "Wallet inputs not found on chain"`,
    text: "",
    children: (
      <Text tone="muted">
        Make sure your wallet is connected to the correct network.
      </Text>
    ),
    id: "20",
  },
  {
    title: "What is a Verified Bond?",
    text: "",
    children: (
      <>
        <Text tone="muted">
          A verified bond is a bond that has been authenticated by the Optim
          team as belonging to a specific Stake Pool Operator. A verified bond
          will replace the OPool ID/Bond ID from the automatically generated
          hash, to whatever the SPO wishes to display in the user interface
          instead, such as the name of the Stake Pool. This will allow for
          easier brand recognition and more efficient marketing efforts.
        </Text>
        <Text tone="muted">
          As a permissionless protocol, anyone can technically issue a bond that
          they can delegate to any pool whether they are verified or not. In
          order to not cause confusion and maintain transparency, Optim will be
          verifying bonds manually after being contacted by an SPO that has
          issued their borrow offer. Only verified bonds will receive OPT token
          incentives for liquidity providers.
        </Text>
      </>
    ),
    id: "21",
  },
  {
    title: "How do I verify a bond?",
    text: "",
    children: (
      <>
        <Text tone="muted">
          If you have not previously been in contact with the Optim team to
          coordinate and assist you in the issuance of a verified bond, please
          take the following steps:
        </Text>
        <Text tone="muted">
          Go through the Issue Bond page to issue your borrow offer. This
          creates the OPool which will be used to pool the liquidity necessary
          to reach the desired amount before the bond is activated. Send the
          OPool ID in addition to the name you would like to be displayed in the
          user interface in an email to optimdao@optim.finance to initiate this
          process.
        </Text>
        <Text tone="muted">
          You will be asked to send 1 ADA to a specific address from the account
          containing your OwnershipNFT. The Metadata of this transaction will
          need to include details about the bond you are in the process of
          verifying. Once your verification has been authenticated it will be
          updated on the website.
        </Text>
      </>
    ),
    id: "22",
  },
];

const Faq = () => {
  const [currentItemId, setCurrentItemId] = useState(faqContent[0]?.id);
  return (
    <div className={styles.container}>
      <CustomTitle title="Faq" />
      <div className={styles.wrapper}>
        {faqIcons.map((item) => {
          return (
            <FaqCard
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.image}
              onClick={() => setCurrentItemId(item.id)}
            />
          );
        })}
      </div>
      <h2 className={styles.heading}>FAQ</h2>
      <div>
        {faqContent.map((item) => (
          <AccordionItem
            key={item.id}
            title={item.title}
            text=""
            isActive={currentItemId === item.id}
            id={item.id}
            onItemClick={setCurrentItemId}
          >
            {item.children}
          </AccordionItem>
        ))}
      </div>
    </div>
  );
};

export default Faq;
