import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Upload,
  CheckCircle,
  TrendingUp,
  Handshake,
  Search,
  Calendar,
  Eye,
  DollarSign,
  MessageSquare,
  Scale,
  FileText,
  Shield,
  Users,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
  gradient: string;
  delay: number;
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, description, step, gradient, delay }) => (
  <motion.div
    className="relative rounded-2xl p-8 border border-border/60 bg-card/50 backdrop-blur-sm text-foreground shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ scale: 1.02 }}
  >
    {/* Step Number Badge */}
    <div className="absolute -top-4 -left-4 w-12 h-12 bg-background text-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-border/60">
      {step}
    </div>

    {/* Icon */}
    <div className="w-16 h-16 bg-secondary/60 rounded-xl flex items-center justify-center mb-6 border border-border/50">
      <div className="w-8 h-8 text-foreground">
        {icon}
      </div>
    </div>

    {/* Content */}
    <h3 className="text-2xl font-bold mb-4 leading-tight">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-base">{description}</p>

    {/* Decorative Element */}
    <div className="absolute bottom-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
  </motion.div>
);

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  
  const sellerSteps = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.upload.title'),
      description: t('home.howItWorks.sellerSteps.upload.description'),
      gradient: ""
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.verification.title'),
      description: t('home.howItWorks.sellerSteps.verification.description'),
      gradient: ""
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.offers.title'),
      description: t('home.howItWorks.sellerSteps.offers.description'),
      gradient: ""
    },
    {
      icon: <Handshake className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.close.title'),
      description: t('home.howItWorks.sellerSteps.close.description'),
      gradient: ""
    }
  ];

  const buyerSteps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.search.title'),
      description: t('home.howItWorks.buyerSteps.search.description'),
      gradient: ""
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.schedule.title'),
      description: t('home.howItWorks.buyerSteps.schedule.description'),
      gradient: ""
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.evaluate.title'),
      description: t('home.howItWorks.buyerSteps.evaluate.description'),
      gradient: ""
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.offer.title'),
      description: t('home.howItWorks.buyerSteps.offer.description'),
      gradient: ""
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.negotiate.title'),
      description: t('home.howItWorks.buyerSteps.negotiate.description'),
      gradient: ""
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.legal.title'),
      description: t('home.howItWorks.buyerSteps.legal.description'),
      gradient: ""
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.sign.title'),
      description: t('home.howItWorks.buyerSteps.sign.description'),
      gradient: ""
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.purchase.title'),
      description: t('home.howItWorks.buyerSteps.purchase.description'),
      gradient: ""
    }
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_55%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-24">

        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary/15"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {t('home.howItWorks.badge')}
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
            {t('home.howItWorks.mainTitle')}
            {' '}
            <span className="text-accent">{t('home.howItWorks.mainTitleHighlight')}</span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('home.howItWorks.mainSubtitle')}
          </p>
        </motion.div>

        {/* Seller Section */}
        <motion.div
          className="mb-32"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center bg-secondary/60 text-foreground px-6 py-3 rounded-2xl text-lg font-bold mb-6 border border-border/60"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Users className="w-7 h-7 mr-3" />
              {t('home.howItWorks.forSellers')}
            </motion.div>
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.howItWorks.sellersTitle')}
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('home.howItWorks.sellersSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sellerSteps.map((step, index) => (
              <StepCard
                key={`seller-${index}`}
                icon={step.icon}
                title={step.title}
                description={step.description}
                step={index + 1}
                gradient={step.gradient}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Commission Badge */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="inline-flex items-center bg-success/15 text-success px-6 py-3 rounded-2xl text-base font-bold shadow-sm border border-success/30">
              <Star className="w-6 h-6 mr-3" />
              {t('home.howItWorks.commission')}
            </div>
          </motion.div>
        </motion.div>

        {/* Buyer Section */}
        <motion.div
          className="mb-32"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center bg-secondary/60 text-foreground px-6 py-3 rounded-2xl text-lg font-bold mb-6 border border-border/60"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="w-7 h-7 mr-3" />
              {t('home.howItWorks.forBuyers')}
            </motion.div>
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.howItWorks.buyersTitle')}
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('home.howItWorks.buyersSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {buyerSteps.map((step, index) => (
              <StepCard
                key={`buyer-${index}`}
                icon={step.icon}
                title={step.title}
                description={step.description}
                step={index + 1}
                gradient={step.gradient}
                delay={index * 0.05}
              />
            ))}
          </div>

          {/* Trust Badge */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="inline-flex items-center bg-secondary/60 text-foreground px-6 py-3 rounded-2xl text-base font-bold shadow-sm border border-border/60">
              <Shield className="w-6 h-6 mr-3" />
              {t('home.howItWorks.protection')}
            </div>
          </motion.div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-12 text-balance">
            {t('home.howItWorks.whyChoose')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-10 h-10 text-primary" />,
                title: t('home.howItWorks.whyFeatures.security.title'),
                description: t('home.howItWorks.whyFeatures.security.description'),
                gradient: ""
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-primary" />,
                title: t('home.howItWorks.whyFeatures.verification.title'),
                description: t('home.howItWorks.whyFeatures.verification.description'),
                gradient: ""
              },
              {
                icon: <TrendingUp className="w-10 h-10 text-primary" />,
                title: t('home.howItWorks.whyFeatures.analysis.title'),
                description: t('home.howItWorks.whyFeatures.analysis.description'),
                gradient: ""
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="relative rounded-3xl p-8 border border-border/60 bg-card/50 backdrop-blur-sm text-foreground shadow-sm overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-secondary/60 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-border/50">
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-bold mb-4 leading-tight">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="rounded-3xl p-12 text-center border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
              <h4 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                {t('home.howItWorks.readyToStart')}
              </h4>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('home.howItWorks.readySubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl text-base font-semibold shadow-sm transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.howItWorks.startNow')}
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </motion.button>
                <motion.button
                  className="border border-border text-foreground hover:bg-accent px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.howItWorks.learnMore')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
