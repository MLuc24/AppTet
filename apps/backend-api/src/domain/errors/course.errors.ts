/**
 * Course Domain Errors
 * Custom error classes for course module
 */

export class CourseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CourseError';
  }
}

export class CourseNotFoundError extends CourseError {
  constructor(message: string = 'Course not found') {
    super(message);
    this.name = 'CourseNotFoundError';
  }
}

export class CourseCodeAlreadyExistsError extends CourseError {
  constructor(message: string = 'Course code already exists') {
    super(message);
    this.name = 'CourseCodeAlreadyExistsError';
  }
}

export class CourseAlreadyPublishedError extends CourseError {
  constructor(message: string = 'Course is already published') {
    super(message);
    this.name = 'CourseAlreadyPublishedError';
  }
}

export class CourseNotPublishableError extends CourseError {
  constructor(
    message: string = 'Course does not meet publishing requirements',
  ) {
    super(message);
    this.name = 'CourseNotPublishableError';
  }
}

export class CourseVersionNotFoundError extends CourseError {
  constructor(message: string = 'Course version not found') {
    super(message);
    this.name = 'CourseVersionNotFoundError';
  }
}

export class CourseVersionNotEditableError extends CourseError {
  constructor(message: string = 'Course version is not editable') {
    super(message);
    this.name = 'CourseVersionNotEditableError';
  }
}

export class UnitNotFoundError extends CourseError {
  constructor(message: string = 'Unit not found') {
    super(message);
    this.name = 'UnitNotFoundError';
  }
}

export class SkillNotFoundError extends CourseError {
  constructor(message: string = 'Skill not found') {
    super(message);
    this.name = 'SkillNotFoundError';
  }
}

export class LessonNotFoundError extends CourseError {
  constructor(message: string = 'Lesson not found') {
    super(message);
    this.name = 'LessonNotFoundError';
  }
}

export class EnrollmentNotFoundError extends CourseError {
  constructor(message: string = 'Enrollment not found') {
    super(message);
    this.name = 'EnrollmentNotFoundError';
  }
}

export class AlreadyEnrolledError extends CourseError {
  constructor(message: string = 'User is already enrolled in this course') {
    super(message);
    this.name = 'AlreadyEnrolledError';
  }
}

export class NotEnrolledError extends CourseError {
  constructor(message: string = 'User is not enrolled in this course') {
    super(message);
    this.name = 'NotEnrolledError';
  }
}

export class CourseNotAccessibleError extends CourseError {
  constructor(message: string = 'Course is not accessible') {
    super(message);
    this.name = 'CourseNotAccessibleError';
  }
}
