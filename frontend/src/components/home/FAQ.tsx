import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "How does the AI generation work?",
        answer: "Simply enter your topic and any key points you want to cover. Our AI analyzes your input and generates a complete interactive dashboard with quizzes, flip cards, progress tracking, and beautiful styling—all in about 30 seconds."
    },
    {
        question: "Do I need design or coding skills?",
        answer: "Not at all! LOVE is designed for educators, trainers, and content creators. Just type your topic and we handle all the design, interactivity, and responsive layouts automatically."
    },
    {
        question: "Can I edit the generated dashboard?",
        answer: "Yes! After generation, you can regenerate with different parameters, or on Pro plans, you'll have access to a visual editor to fine-tune content, colors, and components."
    },
    {
        question: "How does Live Presenter mode work?",
        answer: "When you start a live session, your audience gets a unique link. As you navigate and highlight content, they see your cursor move in real-time—perfect for remote teaching and webinars."
    },
    {
        question: "What happens when my link expires?",
        answer: "Free plan links expire after 7 days. To keep your content live permanently, upgrade to Pro. You can also re-publish expired dashboards anytime."
    },
    {
        question: "Can I use my own domain?",
        answer: "Pro and Team plans include custom domain support. Your dashboards can be hosted on your-brand.com instead of love-app.com."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="faq section">
            <div className="container">
                <div className="faq__header">
                    <span className="meta-label">FAQ</span>
                    <h2>Frequently asked questions</h2>
                </div>

                <div className="faq__list">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}
                        >
                            <button
                                className="faq-item__question"
                                onClick={() => toggle(i)}
                                aria-expanded={openIndex === i}
                            >
                                <span>{faq.question}</span>
                                <ChevronDown className="faq-item__icon" />
                            </button>
                            <div className="faq-item__answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
