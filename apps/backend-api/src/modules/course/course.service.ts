/**
 * Course Service
 * Business logic orchestration for course operations
 */

import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ICourseRepository } from '../../domain/ports/course-repository.port';
import { ICourseVersionRepository } from '../../domain/ports/course-version-repository.port';
import { CourseEntity } from '../../domain/entities/course.entity';
import { CourseVersionStatus } from '../../domain/entities/course-version.entity';
import {
  CourseNotFoundError,
  CourseCodeAlreadyExistsError,
  CourseNotPublishableError,
} from '../../domain/errors/course.errors';
import {
  COURSE_REPOSITORY,
  COURSE_VERSION_REPOSITORY,
  COURSE_MESSAGES,
} from './course.types';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseResponseDto,
  CourseListResponseDto,
  AddLocalizationDto,
} from './course.dto';

@Injectable()
export class CourseService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(COURSE_VERSION_REPOSITORY)
    private readonly courseVersionRepository: ICourseVersionRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async createCourse(
    dto: CreateCourseDto,
    userId?: string,
  ): Promise<CourseResponseDto> {
    // Check if course code already exists
    const exists = await this.courseRepository.existsByCode(dto.courseCode);
    if (exists) {
      throw new ConflictException(COURSE_MESSAGES.CODE_EXISTS);
    }

    // Create course
    const course = await this.courseRepository.create({
      targetLanguageId: dto.targetLanguageId,
      baseLanguageId: dto.baseLanguageId,
      levelId: dto.levelId,
      courseCode: dto.courseCode,
      coverAssetId: dto.coverAssetId,
      createdBy: userId,
      localizations: dto.localizations?.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        description: l.description,
      })),
    });

    // Create initial draft version
    await this.courseVersionRepository.create({
      courseId: course.courseId,
      versionNumber: 1,
      status: CourseVersionStatus.DRAFT,
      createdBy: userId,
    });

    return this.toResponseDto(course, dto.localizations?.[0]?.languageId);
  }

  async getCourseById(
    courseId: string,
    languageId?: number,
  ): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findById(courseId, languageId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }
    return this.toResponseDto(course, languageId);
  }

  async getCourses(query: CourseQueryDto): Promise<CourseListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = {
      targetLanguageId: query.targetLanguageId,
      baseLanguageId: query.baseLanguageId,
      levelId: query.levelId,
      isPublished: query.isPublished,
      search: query.search,
    };

    const [courses, total] = await Promise.all([
      this.courseRepository.findMany({
        skip,
        take: limit,
        filter,
        languageId: query.languageId,
      }),
      this.courseRepository.countByFilter(filter),
    ]);

    const data = await Promise.all(
      courses.map((c) => this.toResponseDto(c, query.languageId)),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCourse(
    courseId: string,
    dto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }

    // Check if new course code already exists
    if (dto.courseCode && dto.courseCode !== course.courseCode) {
      const exists = await this.courseRepository.existsByCode(dto.courseCode);
      if (exists) {
        throw new ConflictException(COURSE_MESSAGES.CODE_EXISTS);
      }
    }

    const updated = await this.courseRepository.update(courseId, {
      targetLanguageId: dto.targetLanguageId,
      baseLanguageId: dto.baseLanguageId,
      levelId: dto.levelId,
      courseCode: dto.courseCode,
      coverAssetId: dto.coverAssetId,
    });

    return this.toResponseDto(updated);
  }

  async deleteCourse(courseId: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }
    await this.courseRepository.delete(courseId);
  }

  async publishCourse(courseId: string): Promise<{ publishedAt: Date }> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }

    if (!course.canPublish()) {
      throw new ConflictException(COURSE_MESSAGES.NOT_PUBLISHABLE);
    }

    // Get draft version and publish it
    const draftVersion =
      await this.courseVersionRepository.findDraftByCourseId(courseId);
    if (!draftVersion) {
      throw new ConflictException(COURSE_MESSAGES.NOT_PUBLISHABLE);
    }

    const publishedAt = new Date();
    await this.courseVersionRepository.update(draftVersion.courseVersionId, {
      status: CourseVersionStatus.PUBLISHED,
      publishedAt,
    });

    await this.courseRepository.update(courseId, { isPublished: true });

    return { publishedAt };
  }

  async archiveCourse(courseId: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }

    const publishedVersion =
      await this.courseVersionRepository.findPublishedByCourseId(courseId);
    if (publishedVersion) {
      await this.courseVersionRepository.update(
        publishedVersion.courseVersionId,
        {
          status: CourseVersionStatus.ARCHIVED,
        },
      );
    }

    await this.courseRepository.update(courseId, { isPublished: false });
  }

  async addLocalization(
    courseId: string,
    dto: AddLocalizationDto,
  ): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }

    await this.courseRepository.addLocalization(courseId, {
      languageId: dto.languageId,
      title: dto.title,
      description: dto.description,
    });
  }

  async updateLocalization(
    courseId: string,
    dto: AddLocalizationDto,
  ): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }

    await this.courseRepository.updateLocalization(courseId, {
      languageId: dto.languageId,
      title: dto.title,
      description: dto.description,
    });
  }

  async deleteLocalization(
    courseId: string,
    languageId: number,
  ): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }

    await this.courseRepository.deleteLocalization(courseId, languageId);
  }

  async getCourseStructure(courseId: string, languageId?: number) {
    const course = await this.courseRepository.findById(courseId, languageId);
    if (!course) {
      throw new NotFoundException(COURSE_MESSAGES.NOT_FOUND);
    }

    // Fetch full course structure with units, skills, and lessons through course_versions
    const structure = await this.prisma.courses.findUnique({
      where: { course_id: courseId },
      include: {
        course_localizations: true,
        course_versions: {
          where: { status: 'published' },
          include: {
            units: {
              include: {
                unit_localizations: true,
                skills: {
                  include: {
                    skill_localizations: true,
                    lessons: {
                      include: {
                        lesson_localizations: true,
                      },
                      orderBy: { order_index: 'asc' },
                    },
                  },
                  orderBy: { order_index: 'asc' },
                },
              },
              orderBy: { order_index: 'asc' },
            },
          },
          take: 1,
        },
      },
    });

    // Fetch cover URL if coverAssetId exists
    let coverUrl: string | undefined;
    if (structure?.cover_asset_id) {
      const asset = await this.prisma.media_assets.findUnique({
        where: { asset_id: structure.cover_asset_id },
        select: { public_url: true, file_url: true },
      });
      
      if (asset) {
        // Return publicUrl if available, otherwise construct from fileUrl
        if (asset.public_url) {
          coverUrl = asset.public_url;
        } else if (asset.file_url) {
          // Construct public URL from fileUrl (format: bucket/path/to/file)
          const r2PublicUrl = process.env.R2_PUBLIC_URL;
          if (r2PublicUrl && asset.file_url.startsWith('lms-files/')) {
            // Extract path after bucket name
            const path = asset.file_url.replace('lms-files/', '');
            coverUrl = `${r2PublicUrl}/${path}`;
          } else {
            // Fallback to fileUrl (will be handled by frontend)
            coverUrl = asset.file_url;
          }
        }
      }
    }

    return {
      ...structure,
      coverUrl,
    };
  }

  private async toResponseDto(
    course: CourseEntity,
    languageId?: number,
  ): Promise<CourseResponseDto> {
    const localization = languageId
      ? course.localizations.find((l) => l.languageId === languageId)
      : course.localizations[0];

    // Fetch cover URL if coverAssetId exists
    let coverUrl: string | undefined;
    if (course.coverAssetId) {
      const asset = await this.prisma.media_assets.findUnique({
        where: { asset_id: course.coverAssetId },
        select: { public_url: true, file_url: true },
      });
      
      if (asset) {
        // Return publicUrl if available, otherwise construct from fileUrl
        if (asset.public_url) {
          coverUrl = asset.public_url;
        } else if (asset.file_url) {
          // Construct public URL from fileUrl (format: bucket/path/to/file)
          const r2PublicUrl = process.env.R2_PUBLIC_URL;
          if (r2PublicUrl && asset.file_url.startsWith('lms-files/')) {
            // Extract path after bucket name
            const path = asset.file_url.replace('lms-files/', '');
            coverUrl = `${r2PublicUrl}/${path}`;
          } else {
            // Fallback to fileUrl (will be handled by frontend)
            coverUrl = asset.file_url;
          }
        }
      }
    }

    return {
      courseId: course.courseId,
      courseCode: course.courseCode,
      targetLanguageId: course.targetLanguageId,
      baseLanguageId: course.baseLanguageId,
      levelId: course.levelId,
      isPublished: course.isPublished,
      coverAssetId: course.coverAssetId,
      coverUrl,
      localizations: course.localizations.map((l) => ({
        languageId: l.languageId,
        title: l.title,
        description: l.description,
      })),
      title: localization?.title,
      description: localization?.description,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
