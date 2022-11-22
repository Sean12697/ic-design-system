import React, { ReactNode, useState } from "react";
import { withPrefix } from "gatsby";

import { Helmet } from "react-helmet";
import { IcBackToTop, IcFooter, IcFooterLink, IcLink } from "@ukic/react";

import "./index.css";
import TopNavWrapper from "../TopNavWrapper";
import { GCHQLogo, MI5Logo, SISLogo } from "../../assets/svg";
import CookieBanner from "../CookieBanner";

import CookieConsentContext from "../../context/CookieConsentContext";
import { consentCookieApproved } from "../CookieBanner/cookies.helper";

const {
  STATUS,
  TITLE,
  VERSION,
  FOOTER_PROPS,
  META_DESCRIPTION,
} = require("../../config");

interface RouteAnnouncerProps {
  page: string;
}

interface LayoutProps {
  contentProps?: {
    index?: boolean;
  };
  title?: string;
  children: ReactNode;
  description?: string;
}

interface FooterLinks {
  text: string;
  key: string;
  link: string;
}

const RouteAnnouncer: React.FC<RouteAnnouncerProps> = ({ page }) => (
  <div
    className="route-announcer"
    role="status"
    aria-live="assertive"
    aria-atomic="true"
  >{`Navigated to ${page}`}</div>
);

const ClientOnly: React.FC<any> = ({ children, ...delegated }) => {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <div {...delegated}>{children}</div>;
};

const Layout: React.FC<LayoutProps> = ({
  contentProps = { index: false },
  title = "",
  description = "",
  children,
}) => {
  const {
    NODE_ENV,
    GATSBY_GA_TRACKING_ID
  } = process.env;
  const IN_PRODUCTION = NODE_ENV === 'production';

  let defaultCookieConsentValue;

  console.log(GATSBY_GA_TRACKING_ID);

  // document object is not available during SSR so a check is in place.
  // document.cookie is required for consentCookieApproved method
  if (typeof document !== 'undefined') {
    defaultCookieConsentValue = consentCookieApproved();
  } else {
    defaultCookieConsentValue = false;
  }

  const [cookieConsent, setCookieConsent] = useState(defaultCookieConsentValue);

  const handleCookieConsent = (consent: boolean) => {
    setCookieConsent(consent);
  }

  const value = React.useMemo(() => ({
    cookieConsent, handleCookieConsent
  }), [cookieConsent, handleCookieConsent])

  return (
  <>
    <Helmet>
      <html lang="en" />
      <title>{title || TITLE} - Intelligence Community Design System</title>
      <meta name="description" content={`${description || META_DESCRIPTION}`} />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GATSBY_GA_TRACKING_ID}`} />
      <script>
        {`
            window.dataLayer = window.dataLayer || [  ];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': '${cookieConsent && IN_PRODUCTION ? 'granted' : 'denied'}',
              'analytics_storage': '${cookieConsent && IN_PRODUCTION ? 'granted' : 'denied'}',
            });
            gtag('js', new Date());
            gtag('config', '${GATSBY_GA_TRACKING_ID}');
        `}
      </script>
    </Helmet>
    <CookieConsentContext.Provider value={value}>
      <ClientOnly>
        {title !== "Cookies Policy" && <CookieBanner />}
        <div className="main-page-container">
          <IcLink href="#main" id="skip" className="skip-content-link">
            Skip to main content
          </IcLink>
          <TopNavWrapper appTitle={TITLE} status={STATUS} version={VERSION} />
          <main id="main" className="homepage-wrapper">
            {children}
            {!contentProps?.index && <IcBackToTop target="main" />}
          </main>
        </div>
        <div className="footer">
          <IcFooter
            description={FOOTER_PROPS.content}
            caption={FOOTER_PROPS.caption}
          >
            {FOOTER_PROPS.footerLinks.map((footerLinks: FooterLinks) => (
              <IcFooterLink
                slot="link"
                href={withPrefix(footerLinks.link)}
                key={footerLinks.key}
              >
                {footerLinks.text}
              </IcFooterLink>
            ))}
            <div slot="logo" className="logo-wrapper">
              <IcFooterLink href="https://sis.gov.uk">
                <SISLogo aria-labelledby="SIS Logo" />
                <span className="link-text">Go to SIS website</span>
              </IcFooterLink>
              <IcFooterLink href="https://www.mi5.gov.uk">
                <MI5Logo aria-labelledby="MI5 Logo" />
                <span className="link-text">Go to MI5 website</span>
              </IcFooterLink>
              <IcFooterLink href="https://gchq.gov.uk">
                <GCHQLogo aria-labelledby="GCHQ Logo" />
                <span className="link-text">Go to GCHQ website</span>
              </IcFooterLink>
            </div>
          </IcFooter>
        </div>
      </ClientOnly>
    </CookieConsentContext.Provider>
    <RouteAnnouncer page={`${title || ""} - ${TITLE}`} />
  </>
)};

export default Layout;