// Allow importing JSX files in TypeScript
declare module '*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

// Allow importing JS files in TypeScript
declare module '*.js' {
  const content: any;
  export default content;
  export * from '*.js';
}

// Define types for our Firebase services
declare module './firebase/courseService' {
  export interface Course {
    id: string;
    title: string;
    description: string;
    color?: string;
    created_at: Date;
    updated_at: Date;
  }

  export function getCourses(): Promise<Course[]>;
  export function getCourse(id: string): Promise<Course>;
  export function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course>;
  export function updateCourse(id: string, course: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>): Promise<Course>;
  export function deleteCourse(id: string): Promise<void>;
}

declare module './firebase/questionService' {
  export interface Question {
    id: string;
    course_id: string;
    title: string;
    content: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: string;
    estimated_time?: number;
    created_at: Date;
    updated_at: Date;
  }

  export function getQuestions(): Promise<Question[]>;
  export function getQuestion(id: string): Promise<Question>;
  export function getQuestionsByCourse(courseId: string): Promise<Question[]>;
  export function createQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Promise<Question>;
  export function updateQuestion(id: string, question: Partial<Omit<Question, 'id' | 'created_at' | 'updated_at'>>): Promise<Question>;
  export function deleteQuestion(id: string): Promise<void>;
}
