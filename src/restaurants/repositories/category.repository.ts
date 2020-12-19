import { EntityRepository, Repository } from "typeorm";
import { Category } from "../entities/category.entity";
import { CategoryInput, CategoryOutput } from "../dtos/category.dto";

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, "-");
    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName })
      );
    }
    return category;
  }

  async findCategoryBySlug(slug: string): Promise<Category> {
    const category: Category = await this.findOne(
      { slug },
      { relations: ["restaurants"] }
    );

    return category;
  }
}
