import React from 'react';
import { Language } from '../types';
import { SCHEDULE_DATA } from '../constants';

interface ScheduleProps {
    language: Language;
}

const Schedule: React.FC<ScheduleProps> = ({ language }) => {
    const schedule = SCHEDULE_DATA[language];
    const headers = {
        en: { time: "Time", activity: "Activity" },
        km: { time: "ពេលវេលា", activity: "សកម្មភាព" }
    };
    const currentHeaders = headers[language];

    return (
        <section id="schedule" className="py-20 bg-secondary/30">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl md:text-4xl font-bold text-primary ${language === 'km' ? 'font-khmer' : ''}`}>
                        {language === 'km' ? 'កាលវិភាគប្រចាំថ្ងៃ' : 'Daily Schedule'}
                    </h2>
                </div>
                <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className={`p-4 text-sm font-semibold text-foreground tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{currentHeaders.time}</th>
                                    <th className={`p-4 text-sm font-semibold text-foreground tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{currentHeaders.activity}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((item, index) => (
                                    <tr key={index} className="border-t border-border bg-card hover:bg-muted/50 transition-colors">
                                        <td className={`p-4 font-semibold text-foreground whitespace-nowrap ${language === 'km' ? 'font-khmer' : ''}`}>{item.time}</td>
                                        <td className={`p-4 text-muted-foreground ${language === 'km' ? 'font-khmer' : ''}`}>{item.activity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
