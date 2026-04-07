import { Footer } from "@/components/utils/Footer";
import { ContentContainer, Page } from "@/components/utils/Layout";
import { NavBar } from "@/components/utils/NavBar";
import { SEO } from "@/components/utils/SEO";
import { Config } from "@/data/config";
import { AboutCardItem } from "@/components/utils/AboutCardItem";
import { aboutPageConfig } from "@/data/about";
import { useEffect } from "react";

export default function AboutPage() {
  const [socialSection, stackSection, hobbySection] = aboutPageConfig.sections;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <Page>
      <SEO
        coverURL={Config.PageCovers.websiteCoverURL}
        description={"了解博主的背景、技术栈、联系方式与这个站点的设计理念。"}
        title="关于"
      />
      <NavBar />
      <ContentContainer>
        <section className="about-page-wrap">
          <div className="about-grid-top">
            <article className="about-card about-intro-card">
              <img
                alt={aboutPageConfig.introCard.avatarAlt}
                className="about-avatar"
                src={aboutPageConfig.introCard.avatarSrc}
              />
              <h2 className="about-intro-title">
                {aboutPageConfig.introCard.greetingText}
                <span>{aboutPageConfig.introCard.greetingName}</span>
              </h2>
              {aboutPageConfig.introCard.introParagraphs.map((paragraph) => (
                <p className="about-intro-text" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </article>

            <article className="about-card">
              <h3 className="about-card-title">
                {aboutPageConfig.conceptCard.title}
              </h3>
              {aboutPageConfig.conceptCard.paragraphs.map((paragraph) => (
                <p className="about-card-text" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </article>
          </div>

          <div className="about-grid-mid">
            <article className="about-card">
              <h3 className="about-card-title">{socialSection.title}</h3>
              <div className="about-link-list">
                {socialSection.items.map((item) => (
                  <AboutCardItem
                    key={item.label}
                    type="link"
                    label={item.label}
                    href={item.href}
                  />
                ))}
              </div>
            </article>

            <article className="about-card">
              <h3 className="about-card-title">{stackSection.title}</h3>
              <div className="about-chip-list">
                {stackSection.items.map((item) => (
                  <AboutCardItem
                    key={item.label}
                    type="chip"
                    label={item.label}
                  />
                ))}
              </div>
            </article>

            <article className="about-card">
              <h3 className="about-card-title">{hobbySection.title}</h3>
              <div className="about-chip-list">
                {hobbySection.items.map((item) => (
                  <AboutCardItem
                    key={item.label}
                    type="chip"
                    label={item.label}
                  />
                ))}
              </div>
            </article>
          </div>
        </section>
      </ContentContainer>
      <Footer />
    </Page>
  );
}
