import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  User,
  Search,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const blogPosts = [
    {
      id: 1,
      titleKey: 'pages.blog.posts.buyGuide.title',
      excerptKey: 'pages.blog.posts.buyGuide.excerpt',
      author: 'María González',
      date: '2025-01-15',
      minutes: 8,
      categoryKey: 'pages.blog.categories.guides',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=300&fit=crop'
    },
    {
      id: 2,
      titleKey: 'pages.blog.posts.bogotaTrends.title',
      excerptKey: 'pages.blog.posts.bogotaTrends.excerpt',
      author: 'Carlos Rodríguez',
      date: '2025-01-12',
      minutes: 6,
      categoryKey: 'pages.blog.categories.market',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=300&fit=crop'
    },
    {
      id: 3,
      titleKey: 'pages.blog.posts.mortgage.title',
      excerptKey: 'pages.blog.posts.mortgage.excerpt',
      author: 'Ana López',
      date: '2025-01-10',
      minutes: 5,
      categoryKey: 'pages.blog.categories.finance',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop'
    }
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const title = t(post.titleKey).toLowerCase();
    const excerpt = t(post.excerptKey).toLowerCase();
    const term = searchTerm.toLowerCase();
    return title.includes(term) || excerpt.includes(term);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('pages.blog.title')}
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              {t('pages.blog.subtitle')}
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('pages.blog.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={post.image}
                    alt={t(post.titleKey)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{t(post.categoryKey)}</Badge>
                      <span className="text-sm text-gray-500">{t('pages.blog.readTime', { minutes: post.minutes })}</span>
                    </div>

                    <CardTitle className="line-clamp-2">
                      {t(post.titleKey)}
                    </CardTitle>

                    <p className="text-gray-600 line-clamp-3">
                      {t(post.excerptKey)}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{post.date}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      {t('common.readMore')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <BookOpen className="w-12 h-12 text-blue-100 mx-auto" />
            <h2 className="text-3xl font-bold text-white">
              {t('pages.blog.newsletterTitle')}
            </h2>
            <p className="text-xl text-blue-100">
              {t('pages.blog.newsletterSubtitle')}
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input
                placeholder={t('pages.blog.emailPlaceholder')}
                className="flex-1"
              />
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                {t('pages.blog.subscribe')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
