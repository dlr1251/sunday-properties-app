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
    className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ scale: 1.02 }}
  >
    {/* Step Number Badge */}
    <div className="absolute -top-4 -left-4 w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center font-bold text-lg shadow-xl">
      {step}
    </div>

    {/* Icon */}
    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
      <div className="w-8 h-8 text-white">
        {icon}
      </div>
    </div>

    {/* Content */}
    <h3 className="text-2xl font-bold mb-4 leading-tight">{title}</h3>
    <p className="text-white/90 leading-relaxed text-lg">{description}</p>

    {/* Decorative Element */}
    <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
  </motion.div>
);

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  
  const sellerSteps = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.upload.title'),
      description: t('home.howItWorks.sellerSteps.upload.description'),
      gradient: "from-blue-500 via-blue-600 to-indigo-700"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.verification.title'),
      description: t('home.howItWorks.sellerSteps.verification.description'),
      gradient: "from-emerald-500 via-green-600 to-teal-700"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.offers.title'),
      description: t('home.howItWorks.sellerSteps.offers.description'),
      gradient: "from-purple-500 via-violet-600 to-indigo-700"
    },
    {
      icon: <Handshake className="w-6 h-6" />,
      title: t('home.howItWorks.sellerSteps.close.title'),
      description: t('home.howItWorks.sellerSteps.close.description'),
      gradient: "from-rose-500 via-pink-600 to-red-700"
    }
  ];

  const buyerSteps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.search.title'),
      description: t('home.howItWorks.buyerSteps.search.description'),
      gradient: "from-cyan-500 via-blue-600 to-indigo-700"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.schedule.title'),
      description: t('home.howItWorks.buyerSteps.schedule.description'),
      gradient: "from-emerald-500 via-green-600 to-teal-700"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.evaluate.title'),
      description: t('home.howItWorks.buyerSteps.evaluate.description'),
      gradient: "from-violet-500 via-purple-600 to-indigo-700"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.offer.title'),
      description: t('home.howItWorks.buyerSteps.offer.description'),
      gradient: "from-amber-500 via-yellow-600 to-orange-700"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.negotiate.title'),
      description: t('home.howItWorks.buyerSteps.negotiate.description'),
      gradient: "from-rose-500 via-pink-600 to-red-700"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.legal.title'),
      description: t('home.howItWorks.buyerSteps.legal.description'),
      gradient: "from-slate-600 via-gray-700 to-zinc-800"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.sign.title'),
      description: t('home.howItWorks.buyerSteps.sign.description'),
      gradient: "from-indigo-500 via-blue-600 to-cyan-700"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('home.howItWorks.buyerSteps.purchase.title'),
      description: t('home.howItWorks.buyerSteps.purchase.description'),
      gradient: "from-emerald-500 via-green-600 to-teal-700"
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background with Multiple Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/50 via-transparent to-cyan-50/50"></div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-400/10 to-pink-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-semibold mb-8 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {t('home.howItWorks.badge')}
          </motion.div>

          <h2 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-8 leading-tight">
            {t('home.howItWorks.mainTitle')}
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('home.howItWorks.mainTitleHighlight')}
            </span>
          </h2>

          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
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
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl text-xl font-bold mb-6 shadow-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Users className="w-7 h-7 mr-3" />
              {t('home.howItWorks.forSellers')}
            </motion.div>
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('home.howItWorks.sellersTitle')}
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl">
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
              className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-xl font-bold mb-6 shadow-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Shield className="w-7 h-7 mr-3" />
              {t('home.howItWorks.forBuyers')}
            </motion.div>
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('home.howItWorks.buyersTitle')}
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <div className="inline-flex items-center bg-gradient-to-r from-slate-700 to-gray-800 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl">
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
          <h3 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-16">
            {t('home.howItWorks.whyChoose')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-10 h-10 text-white" />,
                title: t('home.howItWorks.whyFeatures.security.title'),
                description: t('home.howItWorks.whyFeatures.security.description'),
                gradient: "from-blue-500 via-blue-600 to-indigo-700"
              },
              {
                icon: <CheckCircle className="w-10 h-10 text-white" />,
                title: t('home.howItWorks.whyFeatures.verification.title'),
                description: t('home.howItWorks.whyFeatures.verification.description'),
                gradient: "from-emerald-500 via-green-600 to-teal-700"
              },
              {
                icon: <TrendingUp className="w-10 h-10 text-white" />,
                title: t('home.howItWorks.whyFeatures.analysis.title'),
                description: t('home.howItWorks.whyFeatures.analysis.description'),
                gradient: "from-purple-500 via-violet-600 to-indigo-700"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`relative bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 text-white shadow-2xl overflow-hidden group`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-bold mb-4 leading-tight">{feature.title}</h4>
                  <p className="text-white/90 leading-relaxed text-lg">{feature.description}</p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
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
            <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-12 text-center text-white shadow-2xl">
              <h4 className="text-4xl font-bold mb-6">
                {t('home.howItWorks.readyToStart')}
              </h4>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {t('home.howItWorks.readySubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('home.howItWorks.startNow')}
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </motion.button>
                <motion.button
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
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
