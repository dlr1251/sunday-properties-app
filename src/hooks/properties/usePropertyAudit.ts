import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface PropertyChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export const usePropertyAudit = () => {
  const logPropertyChange = async (
    propertyId: string,
    userId: string,
    changes: PropertyChange[]
  ) => {
    try {
      // Log the change
      const { error: logError } = await supabase
        .from('property_change_log')
        .insert({
          property_id: propertyId,
          user_id: userId,
          changes: changes
        });

      if (logError) {
        console.error('Error logging property change:', logError);
        return;
      }

      // Check if this is a significant change that requires re-approval
      const significantFields = ['price', 'description', 'address', 'area', 'bedrooms', 'bathrooms'];
      const hasSignificantChange = changes.some(change =>
        significantFields.includes(change.field)
      );

      if (hasSignificantChange) {
        // Update property status to submitted for re-review
        const { error: statusError } = await supabase
          .from('properties')
          .update({
            status: 'submitted',
            updated_at: new Date().toISOString()
          })
          .eq('id', propertyId);

        if (statusError) {
          console.error('Error updating property status:', statusError);
        }

        // Notify lawyers and admins
        await notifyLegalReview(propertyId, changes);

        toast.success('Cambios guardados. La propiedad será revisada nuevamente por el equipo legal.');
      } else {
        toast.success('Cambios guardados correctamente.');
      }

    } catch (error) {
      console.error('Error in property audit:', error);
      toast.error('Error al guardar los cambios');
    }
  };

  const notifyLegalReview = async (propertyId: string, changes: PropertyChange[]) => {
    try {
      // Get property details
      const { data: property } = await supabase
        .from('properties')
        .select('title, owner_id')
        .eq('id', propertyId)
        .single();

      if (!property) return;

      // Get lawyers and admins
      const { data: legalUsers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['lawyer', 'admin', 'super_admin']);

      if (!legalUsers || legalUsers.length === 0) return;

      const changeSummary = changes.map(c => `${c.field}: "${c.oldValue}" → "${c.newValue}"`).join(', ');

      // Create notifications for each legal user
      const notifications = legalUsers.map(user => ({
        user_id: user.id,
        type: 'property_updated',
        title: 'Propiedad actualizada - Revisión requerida',
        message: `La propiedad "${property.title}" ha sido modificada. Cambios: ${changeSummary}`,
        data: {
          property_id: propertyId,
          changes: changes,
          owner_id: property.owner_id
        },
        read: false
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating notifications:', error);
      }

    } catch (error) {
      console.error('Error notifying legal review:', error);
    }
  };

  const comparePropertyChanges = (oldProperty: any, newProperty: any): PropertyChange[] => {
    const changes: PropertyChange[] = [];
    const fieldsToCompare = [
      'title', 'description', 'address', 'neighborhood', 'price', 'area',
      'bedrooms', 'bathrooms', 'parking', 'floor', 'total_floors',
      'property_type', 'strata', 'visit_price', 'commission'
    ];

    fieldsToCompare.forEach(field => {
      if (oldProperty[field] !== newProperty[field]) {
        changes.push({
          field,
          oldValue: oldProperty[field],
          newValue: newProperty[field]
        });
      }
    });

    // Handle negotiation_terms as JSON
    if (JSON.stringify(oldProperty.negotiation_terms) !== JSON.stringify(newProperty.negotiation_terms)) {
      changes.push({
        field: 'negotiation_terms',
        oldValue: oldProperty.negotiation_terms,
        newValue: newProperty.negotiation_terms
      });
    }

    return changes;
  };

  return {
    logPropertyChange,
    comparePropertyChanges,
    notifyLegalReview
  };
};
