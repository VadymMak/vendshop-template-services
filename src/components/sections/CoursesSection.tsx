import { getLocale, getTranslations } from 'next-intl/server';
import ScrollReveal from '@/components/ui/ScrollReveal';
import GoldDivider from '@/components/ui/GoldDivider';
import type { CourseItem } from '@/lib/types';

interface Props {
  courses?: CourseItem[];
}

export default async function CoursesSection({ courses = [] }: Props) {
  if (courses.length === 0) return null;

  const locale = await getLocale();
  const t = await getTranslations('courses');

  return (
    <section id="courses" className="section">
      <ScrollReveal className="section-header">
        <p className="section-label">{t('navLabel')}</p>
        <h2 className="section-title">{t('title')}</h2>
        <GoldDivider />
      </ScrollReveal>

      <div className="courses-grid">
        {courses.map((course, i) => (
          <ScrollReveal key={course.id} direction="up" delay={i * 80}>
            <div className="course-card">
              <div className="course-card__header">
                <h3 className="course-card__title">{course.title}</h3>
                <p className="course-card__meta">{course.lessonCount} {t('lessons')}</p>
              </div>
              <div className="course-card__footer">
                <span className="course-card__price">€{course.price}</span>
                <a href={`/${locale}/courses/${course.slug}`} className="btn-primary">{t('enroll')}</a>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
