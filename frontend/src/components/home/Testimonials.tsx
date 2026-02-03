import { Star } from 'lucide-react';

const testimonials = [
    {
        quote: "LOVE transformed how I teach online. My students are actually engaged now, and I can see exactly what resonates with them.",
        author: "Sarah Mitchell",
        role: "IELTS Instructor",
        avatar: "SM",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
        quote: "I used to spend hours on PowerPoint. Now I type a topic and get a beautiful interactive dashboard in 30 seconds. Game changer.",
        author: "James Davidson",
        role: "Corporate Trainer",
        avatar: "JD",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
        quote: "The live presenter mode is incredible. My remote workshops feel like in-person sessions. Clients love following my cursor in real-time.",
        author: "Amanda Kim",
        role: "Education Consultant",
        avatar: "AK",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
];

export function Testimonials() {
    return (
        <section className="testimonials section">
            <div className="container">
                <div className="testimonials__header">
                    <span className="meta-label">Testimonials</span>
                    <h2>Loved by educators worldwide</h2>
                </div>

                <div className="testimonials__grid">
                    {testimonials.map((t, i) => (
                        <div key={i} className="testimonial-card">
                            <div className="testimonial-card__stars">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className="testimonial-card__star" fill="currentColor" />
                                ))}
                            </div>
                            <blockquote className="testimonial-card__quote">
                                "{t.quote}"
                            </blockquote>
                            <div className="testimonial-card__author">
                                <div
                                    className="testimonial-card__avatar"
                                    style={{ background: t.gradient }}
                                >
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="testimonial-card__name">{t.author}</div>
                                    <div className="testimonial-card__role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
