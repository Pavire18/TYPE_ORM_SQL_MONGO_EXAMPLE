import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { AppDataSource } from "../databases/typeorm-datasource";
import { type Repository } from "typeorm";
import { Student } from "../models/typeorm/Student";
import { Course } from "../models/typeorm/Course";

const studentRepository: Repository<Student> = AppDataSource.getRepository(Student);
const courseRepository: Repository<Course> = AppDataSource.getRepository(Course);

// Router
export const studentRouter = Router();

// CRUD: READ
studentRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students: Student[] = await studentRepository.find({ relations: ["course"] });
    res.json(students);
  } catch (error) {
    next(error);
  }
});

studentRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const player = await studentRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["course"],
    });

    if (!player) {
      res.status(404).json({ error: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
studentRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Construimos player
    const newStuent = new Student();

    let courseOfStudent;

    if (req.body.courseId) {
      courseOfStudent = await courseRepository.findOne({
        where: {
          id: req.body.courseId,
        },
      });

      if (!courseOfStudent) {
        res.status(404).json({ error: "Course not found" });
        return;
      }
    }

    // Asignamos valores
    Object.assign(newStuent, {
      ...req.body,
      course: courseOfStudent,
    });

    const studentSaved = await studentRepository.save(newStuent);

    res.status(201).json(studentSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
studentRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const studentToRemove = await studentRepository.findOneBy({
      id: idReceivedInParams,
    });

    if (!studentToRemove) {
      res.status(404).json({ error: "Student not found" });
    } else {
      await studentRepository.remove(studentToRemove);
      res.json(studentToRemove);
    }
  } catch (error) {
    next(error);
  }
});

studentRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const studentToUpdate = await studentRepository.findOneBy({
      id: idReceivedInParams,
    });

    if (!studentToUpdate) {
      res.status(404).json({ error: "Player not found" });
    } else {
      let courseOfStudent;

      if (req.body.courseId) {
        courseOfStudent = await courseRepository.findOne({
          where: {
            id: req.body.courseId,
          },
        });

        if (!courseOfStudent) {
          res.status(404).json({ error: "Course not found" });
          return;
        }
      }

      // Asignamos valores
      Object.assign(studentToUpdate, {
        ...req.body,
        course: courseOfStudent,
      });

      const updatedPlayer = await studentRepository.save(studentToUpdate);
      res.json(updatedPlayer);
    }
  } catch (error) {
    next(error);
  }
});
