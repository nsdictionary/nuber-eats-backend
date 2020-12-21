import { EntityRepository, FindOneOptions, Repository } from "typeorm";
import { Order, OrderStatus } from "../entities/order.entitiy";
import { User, UserRole } from "../../users/entities/user.entity";

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
  async getOrderAndValidate(
    user: User,
    orderId: number
  ): Promise<{ ok: boolean; error?: string; order?: Order }> {
    const order: Order = await this.findOne(orderId);

    if (!order) {
      return { ok: false, error: "Order not found." };
    }

    if (!this.canSeeOrder(user, order)) {
      return { ok: false, error: "You cant see that" };
    }

    return { ok: true, order };
  }

  canEditOrder(user: User, status: OrderStatus): boolean {
    let canEdit = true;
    if (user.role === UserRole.Client) {
      canEdit = false;
    }
    if (user.role === UserRole.Owner) {
      if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
        canEdit = false;
      }
    }
    if (user.role === UserRole.Delivery) {
      if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
        canEdit = false;
      }
    }
    return canEdit;
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }
}
